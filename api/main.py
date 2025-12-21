from fastapi import FastAPI
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright
from fastapi.responses import Response
import asyncio
import sys
import uvicorn

if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

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
   menus =  await get_menu_html()
   return menus
        

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)