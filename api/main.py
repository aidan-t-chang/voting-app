from fastapi import FastAPI
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright
import asyncio

async def get_menu_html():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        await page.goto("https://imsa.campus-dining.com/menus/", wait_until="networkidle")

        await page.locator(".flex-container").wait_for(timeout=5000)
        print("yay found")

        meal_periods = ["Breakfast", "Lunch", "Dinner"]
        daily_menus = {}

        for period in meal_periods:
            
            # open dropdown options 
            await page.click(".k10-menu-selector__panel")
            print("selector panel found and clicked")

            # wait for options container to become visible
            await page.wait_for_selector(".k10-menu-selector__options")
            print("options dropdown has now become visible")

            # look for specific period option
            period_option = page.locator(f".k10-menu-selector__option >> text={period}")
            print(f"the {period} option has been found")

            if await period_option.count() > 0:
                await period_option.click()
                
                await page.wait_for_load_state("networkidle")

                await asyncio.sleep(0.5)

                # write code for retrieving the specific things using bs4 here probs

                print("success clicking the period n stuff")
            else:
                print(f"option {period} not found.")
        
        await browser.close()

app = FastAPI()
@app.get("/menu")
async def read_menu():
    html = await get_menu_html()
    
    soup = BeautifulSoup(html, "html.parser")
    title = soup.title.text if soup.title else "oopsies"

    return {"page_title": title}
        

html_result = asyncio.run(get_menu_html())
print(html_result)