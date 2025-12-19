// Refund Calculator - Regional Pricing Support
// For support teams handling refunds across different currencies

let currentMethod = 'percentage';
let calculationHistory = [];

// Currency symbols for display
const currencySymbols = {
  USD: '$', EUR: '€', GBP: '£', BRL: 'R$', RUB: '₽', TRY: '₺',
  PLN: 'zł', UAH: '₴', ARS: '$', MXN: '$', INR: '₹', IDR: 'Rp',
  PHP: '₱', MYR: 'RM', CNY: '¥', JPY: '¥', KRW: '₩', THB: '฿',
  VND: '₫', ZAR: 'R', CAD: '$', AUD: '$', NZD: '$', SGD: '$',
  HKD: '$', CHF: 'Fr', NOK: 'kr', SEK: 'kr', DKK: 'kr', CZK: 'Kč',
  HUF: 'Ft', RON: 'lei', CLP: '$', COP: '$', PEN: 'S/'
};

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  try {
    // Get DOM elements
    const paidAmountInput = document.getElementById('paidAmount');
    const paidCurrencySelect = document.getElementById('paidCurrency');
    const usdPriceInput = document.getElementById('usdPrice');
    const exchangeRateDisplay = document.getElementById('exchangeRate');
    const convertedValueDisplay = document.getElementById('convertedValue');
    
    const refundValueInput = document.getElementById('refundValue');
    const refundInputGroup = document.getElementById('refundInputGroup');
    const refundLabel = document.getElementById('refundLabel');
    const refundSymbol = document.getElementById('refundSymbol');
    const quickPercentages = document.getElementById('quickPercentages');
    
    const refundAmountUSD = document.getElementById('refundAmountUSD');
    const refundAmountLocal = document.getElementById('refundAmountLocal');
    const remainingAmountDisplay = document.getElementById('remainingAmount');
    
    const copyUsdBtn = document.getElementById('copyUsdBtn');
    const copyLocalBtn = document.getElementById('copyLocalBtn');
    const clearBtn = document.getElementById('clearBtn');
    
    const methodButtons = document.querySelectorAll('.method-btn');
    const quickButtons = document.querySelectorAll('.quick-btn');
    
    const historySection = document.getElementById('historySection');
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    
    const notification = document.getElementById('notification');

    // Verify critical elements exist
    if (!paidAmountInput || !usdPriceInput || !refundAmountUSD) {
      throw new Error('Required elements not found');
    }

    // Load history
    loadHistory();

    // Method selection
    methodButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        methodButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMethod = btn.dataset.method;
        updateMethodUI();
        calculate();
      });
    });

    // Quick percentage buttons
    quickButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        refundValueInput.value = btn.dataset.value;
        calculate();
      });
    });

    // Input listeners for currency conversion
    paidAmountInput.addEventListener('input', () => {
      updateExchangeRate();
      calculate();
    });
    
    paidCurrencySelect.addEventListener('change', () => {
      updateExchangeRate();
      calculate();
    });
    
    usdPriceInput.addEventListener('input', () => {
      updateExchangeRate();
      calculate();
    });

    // Refund value input listener
    refundValueInput.addEventListener('input', calculate);

    // Button listeners
    if (copyUsdBtn) copyUsdBtn.addEventListener('click', () => copyAmount('usd'));
    if (copyLocalBtn) copyLocalBtn.addEventListener('click', () => copyAmount('local'));
    if (clearBtn) clearBtn.addEventListener('click', clearInputs);
    if (clearHistoryBtn) clearHistoryBtn.addEventListener('click', clearHistory);

    // Initial setup
    updateMethodUI();
    calculate();

    function updateExchangeRate() {
      const paidAmount = parseFloat(paidAmountInput.value) || 0;
      const usdPrice = parseFloat(usdPriceInput.value) || 0;
      const currency = paidCurrencySelect.value;

      if (paidAmount > 0 && usdPrice > 0) {
        const rate = paidAmount / usdPrice;
        exchangeRateDisplay.textContent = `1 USD = ${rate.toFixed(4)} ${currency}`;
        
        // Also update the converted display
        convertedValueDisplay.textContent = formatCurrency(usdPrice, 'USD');
      } else if (currency === 'USD') {
        exchangeRateDisplay.textContent = '1:1';
        if (paidAmount > 0) {
          convertedValueDisplay.textContent = formatCurrency(paidAmount, 'USD');
        } else {
          convertedValueDisplay.textContent = '$0.00';
        }
      } else {
        exchangeRateDisplay.textContent = '—';
        convertedValueDisplay.textContent = '$0.00';
      }
    }

    function updateMethodUI() {
      switch (currentMethod) {
        case 'percentage':
          refundLabel.textContent = 'Refund Percentage';
          refundSymbol.textContent = '%';
          refundValueInput.placeholder = '0';
          refundValueInput.max = '100';
          refundInputGroup.style.display = 'block';
          quickPercentages.style.display = 'flex';
          break;
        
        case 'amount':
          refundLabel.textContent = 'Refund Amount (USD)';
          refundSymbol.textContent = '$';
          refundValueInput.placeholder = '0.00';
          refundValueInput.removeAttribute('max');
          refundInputGroup.style.display = 'block';
          quickPercentages.style.display = 'none';
          break;
        
        case 'full':
          refundInputGroup.style.display = 'none';
          quickPercentages.style.display = 'none';
          break;
      }
      
      refundValueInput.value = '';
    }

    function calculate() {
      const paidAmount = parseFloat(paidAmountInput.value) || 0;
      const usdPrice = parseFloat(usdPriceInput.value) || 0;
      const currency = paidCurrencySelect.value;
      
      // Determine the base USD amount for calculations
      let baseUsdAmount = 0;
      let exchangeRate = 1;
      
      if (currency === 'USD') {
        baseUsdAmount = paidAmount;
        exchangeRate = 1;
      } else if (paidAmount > 0 && usdPrice > 0) {
        baseUsdAmount = usdPrice;
        exchangeRate = paidAmount / usdPrice;
      } else if (paidAmount > 0) {
        // If no USD price entered, we can't do conversion
        baseUsdAmount = 0;
      }

      let refundUsd = 0;
      let refundLocal = 0;
      let remainingUsd = 0;

      if (baseUsdAmount > 0) {
        switch (currentMethod) {
          case 'percentage':
            const percentage = Math.min(parseFloat(refundValueInput.value) || 0, 100);
            refundUsd = (baseUsdAmount * percentage) / 100;
            break;
          
          case 'amount':
            const fixedAmount = parseFloat(refundValueInput.value) || 0;
            refundUsd = Math.min(fixedAmount, baseUsdAmount);
            break;
          
          case 'full':
            refundUsd = baseUsdAmount;
            break;
        }
        
        remainingUsd = baseUsdAmount - refundUsd;
        
        // Calculate local currency refund
        if (currency === 'USD') {
          refundLocal = refundUsd;
        } else {
          refundLocal = refundUsd * exchangeRate;
        }
      }

      // Update displays
      refundAmountUSD.textContent = formatCurrency(refundUsd, 'USD');
      remainingAmountDisplay.textContent = formatCurrency(remainingUsd, 'USD');
      
      if (currency === 'USD') {
        refundAmountLocal.textContent = '(Same as USD)';
      } else if (refundLocal > 0) {
        refundAmountLocal.textContent = formatCurrency(refundLocal, currency);
      } else {
        refundAmountLocal.textContent = '—';
      }

      // Update button states
      copyUsdBtn.disabled = refundUsd === 0;
      copyLocalBtn.disabled = refundLocal === 0 || currency === 'USD';
      
      // Add animation to primary result
      const primaryRow = document.querySelector('.result-row.primary');
      if (primaryRow && refundUsd > 0) {
        primaryRow.classList.add('updated');
        setTimeout(() => primaryRow.classList.remove('updated'), 300);
      }
    }

    function formatCurrency(amount, currency) {
      const symbol = currencySymbols[currency] || currency;
      
      // Handle currencies that don't use decimals
      const noDecimalCurrencies = ['JPY', 'KRW', 'VND', 'IDR', 'CLP', 'HUF'];
      const decimals = noDecimalCurrencies.includes(currency) ? 0 : 2;
      
      const formatted = amount.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
      
      return `${symbol}${formatted}`;
    }

    async function copyAmount(type) {
      let amountText = '';
      
      if (type === 'usd') {
        amountText = refundAmountUSD.textContent;
      } else {
        amountText = refundAmountLocal.textContent;
      }
      
      try {
        await navigator.clipboard.writeText(amountText);
        showNotification(`Copied: ${amountText}`, 'success');
        saveToHistory();
      } catch (err) {
        showNotification('Failed to copy', 'error');
        console.error('Copy failed:', err);
      }
    }

    function saveToHistory() {
      const paidAmount = parseFloat(paidAmountInput.value) || 0;
      const usdPrice = parseFloat(usdPriceInput.value) || 0;
      const currency = paidCurrencySelect.value;
      
      const refundValue = currentMethod === 'full' 
        ? 'Full Refund' 
        : (currentMethod === 'percentage' 
          ? `${refundValueInput.value}%` 
          : formatCurrency(parseFloat(refundValueInput.value) || 0, 'USD'));
      
      const historyItem = {
        id: Date.now(),
        paidAmount: paidAmount,
        currency: currency,
        usdPrice: currency === 'USD' ? paidAmount : usdPrice,
        method: currentMethod,
        refundValue: refundValue,
        refundAmountUsd: refundAmountUSD.textContent,
        refundAmountLocal: currency !== 'USD' ? refundAmountLocal.textContent : null,
        timestamp: new Date().toLocaleString()
      };

      calculationHistory.unshift(historyItem);
      if (calculationHistory.length > 15) {
        calculationHistory = calculationHistory.slice(0, 15);
      }

      saveHistory();
      renderHistory();
    }

    function renderHistory() {
      if (!historySection || !historyList) return;
      
      if (calculationHistory.length === 0) {
        historySection.style.display = 'none';
        return;
      }

      historySection.style.display = 'block';
      historyList.innerHTML = '';

      calculationHistory.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const paidDisplay = formatCurrency(item.paidAmount, item.currency);
        const localRefund = item.refundAmountLocal ? ` / ${item.refundAmountLocal}` : '';
        
        historyItem.innerHTML = `
          <div class="history-item-info">
            <div class="primary">
              ${paidDisplay} → ${item.refundValue}
            </div>
            <div class="secondary">
              ${item.timestamp}
            </div>
          </div>
          <div class="history-item-amount">${item.refundAmountUsd}${localRefund}</div>
        `;
        
        historyItem.addEventListener('click', () => {
          navigator.clipboard.writeText(item.refundAmountUsd);
          showNotification(`Copied: ${item.refundAmountUsd}`, 'success');
        });

        historyList.appendChild(historyItem);
      });
    }

    function clearHistory() {
      if (confirm('Clear all calculation history?')) {
        calculationHistory = [];
        saveHistory();
        renderHistory();
        showNotification('History cleared', 'success');
      }
    }

    function clearInputs() {
      paidAmountInput.value = '';
      usdPriceInput.value = '';
      refundValueInput.value = '';
      paidCurrencySelect.value = 'USD';
      exchangeRateDisplay.textContent = '—';
      convertedValueDisplay.textContent = '$0.00';
      calculate();
      paidAmountInput.focus();
    }

    function saveHistory() {
      try {
        chrome.storage.local.set({ refundCalculatorHistory: calculationHistory });
      } catch (err) {
        // Fallback to localStorage if chrome.storage fails
        try {
          localStorage.setItem('refundCalculatorHistory', JSON.stringify(calculationHistory));
        } catch (e) {
          console.error('Failed to save history:', e);
        }
      }
    }

    function loadHistory() {
      try {
        chrome.storage.local.get(['refundCalculatorHistory'], (result) => {
          if (result.refundCalculatorHistory) {
            calculationHistory = result.refundCalculatorHistory;
            renderHistory();
          }
        });
      } catch (err) {
        // Fallback to localStorage
        try {
          const saved = localStorage.getItem('refundCalculatorHistory');
          if (saved) {
            calculationHistory = JSON.parse(saved);
            renderHistory();
          }
        } catch (e) {
          console.error('Failed to load history:', e);
        }
      }
    }

    function showNotification(message, type = 'success') {
      if (!notification) return;
      notification.textContent = message;
      notification.className = `notification ${type} show`;
      
      setTimeout(() => {
        notification.classList.remove('show');
      }, 2500);
    }

  } catch (error) {
    console.error('Error initializing extension:', error);
    const container = document.querySelector('.container');
    if (container) {
      container.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #333;">
          <h2 style="color: #ef4444; margin-bottom: 10px;">Error Loading Extension</h2>
          <p style="margin-bottom: 10px;">${error.message}</p>
          <p style="font-size: 12px; color: #999;">Check the browser console (F12) for details.</p>
        </div>
      `;
    }
  }
}
