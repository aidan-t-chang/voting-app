from fastapi import FastAPI
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright
from fastapi.responses import Response
import firebase_admin
from firebase_admin import firestore, credentials
import asyncio, sys, uvicorn, json, os
from datetime import datetime
from collections import defaultdict

if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

firebase_creds = os.getenv("FIREBASE_CREDENTIALS")

if firebase_creds:
    cred_dict = json.loads(firebase_creds)
    cred = credentials.Certificate(cred_dict)
    app = firebase_admin.initialize_app(cred)
else:
    print("firebase credentials not found. using defaults")
    app = firebase_admin.intialize_app()

db = firestore.client()

async def get_menu_html():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # navigate directly to the menu application to avoid iframe issues
        await page.goto("https://menus.campus-dining.com/eliorna/d1654", wait_until="networkidle")

        # wait for specific menu element instead of a generic container
        try:
            await page.locator(".k10-menu-selector__panel").wait_for(timeout=10000)
            print("yay found menu selector")
        except Exception as e:
            print(f"Could not find menu selector: {e}")
            await browser.close()
            return {}

        meal_periods = []
        # there is no breakfast meal period on saturdays and sundays
        # find what date it is and check if it is either saturday or sunday
        try:
            date_locator = page.locator(".k10-menu-date-selector__name")
            await date_locator.wait_for(timeout=10000)
            print("found where the date is")

            date_text = await date_locator.text_content()
            first_word = date_text.split()[0]
            if first_word == "Saturday," or first_word == "Sunday,":
                meal_periods = ["Lunch", "Dinner"]
                print("weekend, so no breakfast")
            else:
                meal_periods = ["Breakfast", "Lunch", "Dinner"]
        except Exception as e:
            print("did not find the date, assuming its the weekend")

        daily_menus = {}
        visit = set()
        previous_dom_items = set()

        for period in meal_periods:
            
            # open dropdown options 
            await page.click(".k10-menu-selector__panel")

            # wait for options container to become visible
            await asyncio.sleep(0.5)

            # look for specific period option
            period_option = page.locator(f".k10-menu-selector__option >> text={period}")

            if await period_option.count() > 0:
                print(f"the {period} option has been found")
                await period_option.click()
                
                await page.locator(".k10-menu-selector__panel").filter(has_text=period).wait_for()

                elements = []
                current_dom_items = set()
                
                # wait for dom elements to load
                for _ in range(10):
                    await asyncio.sleep(0.5)
                    current_html = await page.content()

                    soup = BeautifulSoup(current_html, "html.parser")
                    elements = soup.find_all("span", class_="k10-recipe__name")
                    current_dom_items = {item.get_text(strip=True) for item in elements}

                    if current_dom_items != previous_dom_items:
                        break
                
                previous_dom_items = current_dom_items

                items = []
                for item in elements:
                    new = item.get_text(strip=True)
                    if new not in visit:
                       items.append(new) 
                       visit.add(new)

                daily_menus[period] = items

                print(f"found {len(items)} items for {period}")
            else:
                print(f"option {period} not found.")
        
        for key in daily_menus:
            print(f"for {key}: {daily_menus[key]}")
        await browser.close()

        return daily_menus

app = FastAPI()

@app.get("/")
def default():
    return {"hello": "world"}

@app.get("/favicon.ico", include_in_schema=False)
async def no_favicon():
    return Response(status_code=204)

@app.get("/menu")
async def read_menu():
    menus = await get_menu_html()
    doc_ref = db.collection("menu").document("daily")
    now = datetime.now()
    menus["last_updated"] = now
    doc_ref.set(menus)
    print("saved to daily")

    today_foods = set()
    for value in menus.values():
        if isinstance(value, list):
            today_foods.update(value)

    today_foods_list = list(today_foods)

    doc_ref2 = db.collection("all-foods").document(str(now).split()[0])
    all_foods_data = menus.copy()
    doc_ref2.set(all_foods_data)


    batch = db.batch()
    for food_name in today_foods:
        sanitized = food_name.replace("/", "-")
        
        food_ref = db.collection("foods").document(sanitized)

        doc = food_ref.get()
        if not doc.exists: # if it is a new item
            batch.set(food_ref, {
                "name": food_name,
                "score": 0,
                "num_ratings": 0,
                "last_seen": str(now).split()[0],
                "avg_rating": 0,
            })
        else: # update last_seen to be today
            batch.update(food_ref, {"last_seen": str(now).split()[0]})
    batch.commit()
    print("batch committed")
   
    print(f"saved food items")
    return menus
        
@app.get("/get_menu")
async def get_menu():
    doc_ref = db.collection("menu").document("daily")
    doc = doc_ref.get()
    if doc.exists:
        return doc.to_dict()
    else:
        return {}

@app.get("/update-ratings")
async def update_ratings():
    # this job will run at the end of the day
    # steps:
    # 1. go through <ratings-foodname> and get an average rating + the number of ratings for and find # comments for each item
    # 2. update <foods> with above values 
    # 3. calculate ranking of the food item based on avg_rating_rank, num_ratings_rank, num_comments_rank, and lowest_avg_rating_rank
    # 4. move current rankings from step 4 into prev_ar, prev_nr, prev_nc, and prev_lar
    # 5. add calculations to the fields of the same name 
    # 6. go through ratings-userid and get # comments, and then update the numComments field with number of comments for a user
    foods_ref = db.collection("foods")
    ratings_foodname_ref = db.collection("ratings-foodname")

    # step 1 
    for doc in ratings_foodname_ref.stream():
        food_doc_id = doc.id
        data = doc.to_dict()

        print(f"processing {food_doc_id}")

        rating_number_count = 0
        ratings_sum = 0
        comments_count = 0

        for user_id, rating_info in data.items():
            rating_val = rating_info.get("rating", 0)
            comment = rating_info.get("comment", "")

            rating_number_count += 1
            ratings_sum += rating_val
            comments_count += 1 if comment != "" else 0
        
        avg_rating = ratings_sum / rating_number_count if rating_number_count else 0

        # step 2
        foods_ref.document(food_doc_id).update({
            "avg_rating": avg_rating,
            "num_ratings": rating_number_count,
            "num_comments": comments_count
        })

    # ranking calculations
    
    all_foods = []
    for doc in foods_ref.stream():
        data = doc.to_dict()
        data['id'] = doc.id

        # step 4
        data['prev_ar'] = data.get('avg_rating_rank')
        data['prev_nr'] = data.get('num_ratings_rank')
        data['prev_nc'] = data.get("num_comments_rank")
        data['prev_lar'] = data.get('lowest_avg_rating_rank')

        if 'avg_rating' not in data: data['avg_rating'] = 0
        if 'num_ratings' not in data: data['num-ratings'] = 0
        if 'num_comments' not in data: data['num_comments'] = 0

        all_foods.append(data)
    
    # step 3
    def assign_ranks(items, sort_key, rank_key, reverse=True):
        items.sort(key=lambda x: x.get(sort_key, 0) or 0, reverse=reverse)

        for i, item in enumerate(items):
            item[rank_key] = i + 1
    
    assign_ranks(all_foods, 'avg_rating', 'avg_rating_rank', reverse=True)
    assign_ranks(all_foods, 'num_ratings', 'num_ratings_rank', reverse=True)
    assign_ranks(all_foods, 'num_comments', 'num_comments_rank', reverse=True)
    assign_ranks(all_foods, 'avg_rating', 'lowest_avg_rating_rank', reverse=False)

    # step 5
    batch = db.batch()
    batch_count = 0
    batch_limit = 400
    
    for food in all_foods:
        doc_ref = foods_ref.document(food['id'])

        update_data = {
           "avg_rating_rank": food['avg_rating_rank'],
           "num_ratings_rank": food['num_ratings_rank'],
           "num_comments_rank": food['num_comments_rank'],
           "lowest_avg_rating_rank": food['lowest_avg_rating_rank'],
           "prev_ar": food['prev_ar'],
           "prev_nr": food['prev_nr'],
           "prev_nc": food['prev_nc'],
           "prev_lar": food['prev_lar']
        }

        batch.update(doc_ref, update_data)
        batch_count += 1

        if batch_count >= batch_limit:
            batch.commit()
            batch = db.batch()
            batch_count = 0
            print("committed batch")
    
    if batch_count > 0:
        batch.commit()
    
    # step 6 - get and update number comments for each user
    ratings_userid_ref = db.collection("ratings-userid")
    users_ref = db.collection("users")

    for user_id in ratings_userid_ref.stream():
        ratings = user_id.to_dict()
        current_uid = user_id.id


        user_comments_count = 0
        for i in range(len(ratings)):
            user_comments_count += 1 if comment != "" else 0
    users_ref.document(current_uid).update({
        "numComments": user_comments_count
    })
        

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)