# 💰 Refund Calculator - Browser Extension

A browser extension designed for support teams to quickly calculate refund amounts with **regional pricing support**. No more manual calculations!

## ✨ Features

- **🌍 Regional Pricing Support** - Handle refunds for customers who paid in different currencies (BRL, EUR, TRY, RUB, and 30+ more)
- **📊 Automatic Exchange Rate Calculation** - Enter what the customer paid and the USD base price to auto-calculate exchange rates
- **🧮 Multiple Refund Methods**
  - **Percentage** - Refund a percentage of the original amount (25%, 50%, 75%, 100%)
  - **Fixed Amount** - Refund a specific USD amount
  - **Full Refund** - One-click full refund calculation
- **📋 One-Click Copy** - Copy refund amounts in USD or local currency
- **📜 Calculation History** - Track your last 15 calculations for reference
- **🎨 Modern UI** - Clean, intuitive interface that's easy on the eyes

## 🚀 Installation

### Chrome / Edge / Brave (Chromium-based browsers)

1. Download or clone this repository
2. Open your browser and navigate to:
   - **Chrome**: `chrome://extensions`
   - **Edge**: `edge://extensions`
   - **Brave**: `brave://extensions`
3. Enable **"Developer mode"** (toggle in top-right corner)
4. Click **"Load unpacked"**
5. Select the `refund-calculator` folder
6. The extension icon will appear in your toolbar!

### Firefox

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click **"Load Temporary Add-on"**
3. Select any file in the `refund-calculator` folder (e.g., `manifest.json`)
4. The extension will load temporarily (until browser restart)

> **Note**: For permanent Firefox installation, the extension would need to be signed by Mozilla or installed from Firefox Add-ons.

## 📖 How to Use

### Basic USD Refund
1. Click the extension icon in your toolbar
2. Enter the **Customer Paid** amount (in USD)
3. Select refund method (Percentage, Fixed Amount, or Full)
4. Click **Copy USD** to copy the refund amount

### Regional Pricing Refund
1. Click the extension icon
2. Enter the **Customer Paid** amount (e.g., `49.99`)
3. Select the **Currency** they paid in (e.g., `BRL`)
4. Enter the **USD Base Price** (the normal USD price for the product, e.g., `9.99`)
5. The extension calculates the exchange rate automatically
6. Select refund method and percentage
7. Copy either:
   - **USD amount** - for your payment processor
   - **Local amount** - to tell the customer what they'll receive

### Example Workflow
> Customer from Brazil paid R$49.99 for a product that costs $9.99 USD. They want a 50% refund.

1. Enter `49.99` in Customer Paid
2. Select `BRL (R$)` as currency
3. Enter `9.99` in USD Base Price
4. Click **50%** quick button (or enter manually)
5. Results show:
   - **Refund (USD)**: $4.99
   - **Refund (Local)**: R$24.99
6. Copy the amount you need!

## 🌐 Supported Currencies

| Currency | Symbol | Region |
|----------|--------|--------|
| USD | $ | United States |
| EUR | € | European Union |
| GBP | £ | United Kingdom |
| BRL | R$ | Brazil |
| RUB | ₽ | Russia |
| TRY | ₺ | Turkey |
| PLN | zł | Poland |
| UAH | ₴ | Ukraine |
| ARS | $ | Argentina |
| MXN | $ | Mexico |
| INR | ₹ | India |
| IDR | Rp | Indonesia |
| PHP | ₱ | Philippines |
| MYR | RM | Malaysia |
| CNY | ¥ | China |
| JPY | ¥ | Japan |
| KRW | ₩ | South Korea |
| THB | ฿ | Thailand |
| VND | ₫ | Vietnam |
| ZAR | R | South Africa |
| CAD | $ | Canada |
| AUD | $ | Australia |
| NZD | $ | New Zealand |
| SGD | $ | Singapore |
| HKD | $ | Hong Kong |
| CHF | Fr | Switzerland |
| NOK | kr | Norway |
| SEK | kr | Sweden |
| DKK | kr | Denmark |
| CZK | Kč | Czech Republic |
| HUF | Ft | Hungary |
| RON | lei | Romania |
| CLP | $ | Chile |
| COP | $ | Colombia |
| PEN | S/ | Peru |

## 🔒 Privacy

This extension:
- ✅ Works completely offline
- ✅ Stores calculation history locally on your device only
- ✅ Does not send any data to external servers
- ✅ Does not access any websites or browsing data

## 🛠 Development

### File Structure
```
refund-calculator/
├── manifest.json      # Extension manifest
├── background.js      # Service worker
├── popup/
│   ├── popup.html     # Extension popup UI
│   ├── popup.css      # Styles
│   └── popup.js       # Logic and calculations
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

### Making Changes
1. Edit files as needed
2. Go to `chrome://extensions`
3. Click the refresh icon on the extension card
4. Changes will take effect immediately

## 📝 Version History

- **v1.0.1** - Added regional pricing support with 35+ currencies
- **v1.0.0** - Initial release with basic refund calculations

## 💡 Tips for Support Teams

1. **Bookmark common exchange rates** - If you frequently handle refunds for specific regions, keep a note of typical exchange rates to quickly verify calculations
2. **Use the history** - Click any item in history to copy its USD refund amount
3. **Quick percentages** - Use the 25%, 50%, 75%, 100% buttons for common refund amounts
4. **Clear between tickets** - Use the Clear button when starting a new ticket to avoid confusion

---

Made with ❤️ for support teams everywhere
