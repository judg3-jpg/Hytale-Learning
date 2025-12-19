// Refund Calculator - Popup Script

let currentMethod = 'percentage';
let calculationHistory = [];

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  try {
    // Get DOM elements
    const originalAmountInput = document.getElementById('originalAmount');
    const refundValueInput = document.getElementById('refundValue');
    const refundInputGroup = document.getElementById('refundInputGroup');
    const refundLabel = document.getElementById('refundLabel');
    const refundSymbol = document.getElementById('refundSymbol');
    const refundAmountDisplay = document.getElementById('refundAmount');
    const remainingAmountDisplay = document.getElementById('remainingAmount');
    const calculateBtn = document.getElementById('calculateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const clearBtn = document.getElementById('clearBtn');
    const methodButtons = document.querySelectorAll('.method-btn');
    const historySection = document.getElementById('historySection');
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const notification = document.getElementById('notification');

    // Verify critical elements exist
    if (!originalAmountInput || !refundValueInput || !refundAmountDisplay) {
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

    // Input listeners
    originalAmountInput.addEventListener('input', calculate);
    refundValueInput.addEventListener('input', calculate);

    // Button listeners
    if (calculateBtn) calculateBtn.addEventListener('click', calculate);
    if (copyBtn) copyBtn.addEventListener('click', copyRefundAmount);
    if (clearBtn) clearBtn.addEventListener('click', clearInputs);
    if (clearHistoryBtn) clearHistoryBtn.addEventListener('click', clearHistory);

    // Initial setup
    updateMethodUI();
    calculate();

    function updateMethodUI() {
      switch (currentMethod) {
        case 'percentage':
          refundLabel.textContent = 'Refund Percentage';
          refundSymbol.textContent = '%';
          refundValueInput.placeholder = '0';
          refundValueInput.max = '100';
          refundInputGroup.style.display = 'block';
          break;
        
        case 'amount':
          refundLabel.textContent = 'Refund Amount';
          refundSymbol.textContent = '$';
          refundValueInput.placeholder = '0.00';
          refundValueInput.removeAttribute('max');
          refundInputGroup.style.display = 'block';
          break;
        
        case 'full':
          refundInputGroup.style.display = 'none';
          break;
      }
      
      refundValueInput.value = '';
      calculate();
    }

    function calculate() {
      const originalAmount = parseFloat(originalAmountInput.value) || 0;
      let refundAmount = 0;
      let remainingAmount = 0;

      if (originalAmount <= 0) {
        refundAmount = 0;
        remainingAmount = 0;
      } else {
        switch (currentMethod) {
          case 'percentage':
            const percentage = parseFloat(refundValueInput.value) || 0;
            refundAmount = (originalAmount * percentage) / 100;
            remainingAmount = originalAmount - refundAmount;
            break;
          
          case 'amount':
            const fixedAmount = parseFloat(refundValueInput.value) || 0;
            refundAmount = Math.min(fixedAmount, originalAmount);
            remainingAmount = originalAmount - refundAmount;
            break;
          
          case 'full':
            refundAmount = originalAmount;
            remainingAmount = 0;
            break;
        }
      }

      refundAmountDisplay.textContent = formatCurrency(refundAmount);
      remainingAmountDisplay.textContent = formatCurrency(remainingAmount);
      if (copyBtn) copyBtn.disabled = refundAmount === 0;
    }

    function formatCurrency(amount) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    }

    async function copyRefundAmount() {
      const refundAmount = refundAmountDisplay.textContent;
      
      try {
        await navigator.clipboard.writeText(refundAmount);
        showNotification('Refund amount copied!', 'success');
        saveToHistory(refundAmount);
      } catch (err) {
        showNotification('Failed to copy', 'error');
        console.error('Copy failed:', err);
      }
    }

    function saveToHistory(refundAmount) {
      const originalAmount = parseFloat(originalAmountInput.value) || 0;
      const refundValue = currentMethod === 'full' 
        ? '100%' 
        : (currentMethod === 'percentage' 
          ? `${refundValueInput.value}%` 
          : formatCurrency(parseFloat(refundValueInput.value) || 0));
      
      const historyItem = {
        id: Date.now(),
        originalAmount: originalAmount,
        method: currentMethod,
        refundValue: refundValue,
        refundAmount: refundAmount,
        timestamp: new Date().toLocaleString()
      };

      calculationHistory.unshift(historyItem);
      if (calculationHistory.length > 10) {
        calculationHistory = calculationHistory.slice(0, 10);
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
        historyItem.innerHTML = `
          <div class="history-item-info">
            <div style="font-weight: 600; margin-bottom: 2px;">
              ${formatCurrency(item.originalAmount)} ג†’ ${item.refundValue}
            </div>
            <div style="font-size: 11px; color: #999;">
              ${item.timestamp}
            </div>
          </div>
          <div class="history-item-amount">${item.refundAmount}</div>
        `;
        
        historyItem.addEventListener('click', () => {
          navigator.clipboard.writeText(item.refundAmount);
          showNotification('Amount copied!', 'success');
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
      originalAmountInput.value = '';
      refundValueInput.value = '';
      calculate();
      originalAmountInput.focus();
    }

    function saveHistory() {
      try {
        chrome.storage.local.set({ refundCalculatorHistory: calculationHistory });
      } catch (err) {
        console.error('Failed to save history:', err);
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
        console.error('Failed to load history:', err);
      }
    }

    function showNotification(message, type = 'success') {
      if (!notification) return;
      notification.textContent = message;
      notification.className = `notification ${type} show`;
      
      setTimeout(() => {
        notification.classList.remove('show');
      }, 3000);
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
