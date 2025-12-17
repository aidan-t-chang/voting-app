from fastapi import FastAPI
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright
import asyncio

async def get_menu_html():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        await page.goto("https://imsa.campus-dining.com/menus/", wait_until="networkidle")

        content = await page.content()
        await browser.close()
        return content

app = FastAPI()
@app.get("/menu")
async def read_menu():
    html = await get_menu_html()
    
    soup = BeautifulSoup(html, "html.parser")
    title = soup.title.text if soup.title else "oopsies"

    return {"page_title": title}
        

html_result = asyncio.run(get_menu_html())
print(html_result)