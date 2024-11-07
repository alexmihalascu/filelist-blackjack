
# ♠️ Filelist BlackJack Automation

This project automates the process of logging into **Filelist.io** and playing Blackjack using **Puppeteer**.

## 📋 Requirements

- **Filelist.io VIP Account** (required to access and play Blackjack)
- **Node.js** and **npm** (Node Package Manager)
- **Puppeteer**

## 🚀 Setup

1. **Clone the Repository**

   Clone this repository to your local machine:
   ```bash
   git clone https://github.com/alexmihalascu/filelist-blackjack.git
   ```

2. **Navigate to the Project Directory**

   After cloning, move into the project directory:
   ```bash
   cd filelist-blackjack
   ```

3. **Install Dependencies**

   Install the required Node modules, including Puppeteer:
   ```bash
   npm install
   ```

4. **Configuration**

   - Modify the `config.json` file in the root of the project with your **Filelist.io** credentials:
     ```json
     {
         "username": "yourUsername",
         "password": "yourPassword",
         "numberOfGames": 5
     }
     ```
   - Replace `yourUsername` and `yourPassword` with your actual **Filelist.io** credentials, and adjust the `numberOfGames` field to the number of games you’d like the script to play.

   ⚠️ Ensure this file is kept secure and not shared publicly, as it contains sensitive information.

## 🎮 Usage

To run the script, use the following command:
```bash
node blackjack.js
```

The script will log into **Filelist.io** and automate the Blackjack game for the specified number of rounds.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
