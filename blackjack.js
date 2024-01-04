const puppeteer = require('puppeteer');
const config = require('./config.json');

(async () => {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });

        const waitFor = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));

        const navigateTo = async (url) => {
            try {
                await page.goto(url, { waitUntil: 'networkidle2' });
            } catch (error) {
                console.error(`Error navigating to ${url}:`, error);
                throw error;
            }
        };

        await navigateTo('https://filelist.io/login.php');
        await page.waitForSelector('#username', { timeout: 3000 });
        await page.type('#username', config.username);
        await page.type('#password', config.password);
        await page.click('.btn');
        await page.waitForNavigation({ timeout: 2500 }).catch(() => {
            console.log("Navigation timeout after login, proceeding anyway.");
        });

        const getCoinBalance = async () => {
            const balanceSelector = "img[src='/styles/images/flcoins.png']";
            try {
                const balanceText = await page.evaluate((sel) => {
                    const img = document.querySelector(sel);
                    return img.nextSibling.textContent.trim();
                }, balanceSelector);
                return parseFloat(balanceText.replace(/,/g, '')); // Remove commas for proper conversion to number
            } catch (e) {
                console.error('Error fetching coin balance:', e);
                return null;
            }
        };

        const startingCoins = await getCoinBalance();
        if (startingCoins === null) {
            throw new Error('Unable to fetch starting coin balance');
        }
        console.log(`Login successful. Starting coin balance: ${startingCoins}`);

        await navigateTo('https://filelist.io/blackjack.php');

    const getPointsInfo = async () => {
        return await page.evaluate(() => {
            const pointsContainer = document.querySelector('.cblock-innercontent div[align="center"]');
            const pointsText = pointsContainer ? pointsContainer.querySelector('b')?.textContent : null;
            if (pointsText && pointsText.includes('points')) {
                const match = pointsText.match(/You have (\d+) points!/);
                return match ? { points: parseInt(match[1], 10), valid: true } : { valid: false };
            } else {
                return { valid: false };
            }
        });
    };

    const makeDecision = async (points) => {
        if (points < 17) {
            const hitButtonSelector = 'input[type="submit"][value="Hit Me!"]';
            const hitButtonExists = await page.$(hitButtonSelector) !== null;
            if (hitButtonExists) {
                await page.waitForSelector(hitButtonSelector, { visible: true });
                await page.click(hitButtonSelector);
                console.log("Action: Hit");
            }
        } else {
            const stayButtonSelector = 'input[type="submit"][value="Stay!"]';
            const stayButtonExists = await page.$(stayButtonSelector) !== null;
            if (stayButtonExists) {
                await page.waitForSelector(stayButtonSelector, { visible: true });
                await page.click(stayButtonSelector);
                console.log("Action: Stay");
            }
            return false; // No more actions needed, stay means end of the game
        }
        return true; // Continue game if hit
    };

    const playBlackjack = async () => {
        let isFirstRound = true;
        let gameInProgress = true;
    
        while (gameInProgress) {
            try {
                if (isFirstRound) {
                    const playButtonSelector = 'input[type="submit"][value="Play!"]';
                    if (await page.$(playButtonSelector) !== null) {
                        await page.waitForSelector(playButtonSelector, { visible: true });
                        await page.click(playButtonSelector);
                        isFirstRound = false;
                    } else {
                        console.log("Play button not found, checking for Continue button.");
                        const continueButtonSelector = 'input[type="submit"][value="Continue!"]';
                        if (await page.$(continueButtonSelector) !== null) {
                            await page.waitForSelector(continueButtonSelector, { visible: true });
                            await page.click(continueButtonSelector);
                            isFirstRound = false;
                        } else {
                            console.log("Neither Play nor Continue button found. Unable to continue the game.");
                            break;
                        }
                    }
                }
    
                await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 2000 }).catch(() => {});
                await waitFor(2000);
    
                const pointsInfo = await getPointsInfo();
                if (!pointsInfo.valid) {
                    console.log('Points information not available or in an unexpected format.');
                    const continueButtonExists = await page.$('input[type="submit"][value="Continue!"]') !== null;
                    if (continueButtonExists) {
                        console.log("Continue button found. Continuing the game.");
                        await page.click('input[type="submit"][value="Continue!"]');
                        continue;
                    } else {
                        console.log("Continue button not found. Unable to continue the game.");
                        break;
                    }
                }
    
                console.log(`Current Points: ${pointsInfo.points}`);
                gameInProgress = await makeDecision(pointsInfo.points);
    
                if (!gameInProgress) {
                    const gameOver = await page.evaluate(() => {
                        return document.body.innerHTML.includes('<h1>Game Over!</h1>');
                    });
    
                    if (gameOver) {
                        console.log('Game over. Navigating back to the blackjack page.');
                        await waitFor(3000);
                        await navigateTo('https://filelist.io/blackjack.php');
                        break;
                    }
                }
    
                await waitFor(2000); // Wait for the page to reload after an action
    
            } catch (e) {
                console.error('An error occurred during the game:', e);
                await navigateTo('https://filelist.io/blackjack.php');
                break;
            }
        }
    };
    

    for (let i = 0; i < config.numberOfGames; i++) {
        console.log(`Starting Game ${i + 1}`);
        await playBlackjack();
        console.log(`Game ${i + 1} Complete`);
    }

    const endingCoins = await getCoinBalance();
    if (endingCoins === null) {
        throw new Error('Unable to fetch ending coin balance');
    }
    console.log(`All ${config.numberOfGames} games played.`);
    console.log(`Ending coin balance: ${endingCoins}`);

    const coinDifference = endingCoins - startingCoins;
    console.log(`Coin balance change: ${coinDifference > 0 ? '+' : ''}${coinDifference}`);

} catch (error) {
    console.error('An unexpected error occurred:', error);
} finally {
    if (browser) {
        await browser.close();
    }
}
})();