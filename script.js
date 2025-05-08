// JavaScript code for the Daily Report application
document.addEventListener("DOMContentLoaded", function () {
  // Set current date and time with real-time updates
  function updateTime() {
    const now = new Date();
    document.getElementById("currentTime").textContent =
      now.toLocaleString();
  }

  // Update time immediately and then every second
  updateTime();
  setInterval(updateTime, 1000);

  // Vendor management
  const vendorSelect = document.getElementById("vendorSelect");
  const addVendorBtn = document.getElementById("addVendorBtn");
  const customVendorInput = document.getElementById("customVendorInput");
  const customVendorName = document.getElementById("customVendorName");
  const addCustomVendorBtn =
    document.getElementById("addCustomVendorBtn");
  const vendorListContainer = document.getElementById(
    "vendorListContainer"
  );

  // Form elements
  const form = document.getElementById("dailyReportForm");
  const calculateBtn = document.getElementById("calculateBtn");
  const printBtn = document.getElementById("printBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const resetBtn = document.getElementById("resetBtn");

  // Store vendor data
  let vendors = [];
  let nextVendorId = 1;

  // Format currency
  function formatMoney(value) {
    const num = parseFloat(value) || 0;
    return num.toFixed(2);
  }

  // Show custom vendor input when "Add Custom Vendor" is selected
  vendorSelect.addEventListener("change", function () {
    if (this.value === "custom") {
      customVendorInput.classList.remove("d-none");
      customVendorName.focus();
    } else {
      customVendorInput.classList.add("d-none");
    }
  });

  // Add vendor from dropdown
  addVendorBtn.addEventListener("click", function () {
    const selectedValue = vendorSelect.value;

    if (selectedValue && selectedValue !== "custom") {
      addVendor(selectedValue);
      vendorSelect.selectedIndex = 0; // Reset dropdown
    } else if (selectedValue === "custom") {
      customVendorName.focus();
    } else {
      alert("Please select a vendor");
    }
  });

  // Add custom vendor
  addCustomVendorBtn.addEventListener("click", function () {
    const name = customVendorName.value.trim();
    if (name) {
      addVendor(name);
      customVendorName.value = "";
      customVendorInput.classList.add("d-none");
      vendorSelect.selectedIndex = 0; // Reset dropdown
    } else {
      alert("Please enter a vendor name");
    }
  });

  // Add a vendor to the list
  function addVendor(name) {
    const vendorId = `vendor-${nextVendorId++}`;

    // Create vendor object
    const vendor = {
      id: vendorId,
      name: name,
      amount: 0,
    };

    vendors.push(vendor);

    // Create DOM element for vendor
    const vendorElement = document.createElement("div");
    vendorElement.id = vendorId;
    vendorElement.className = "vendor-item";
    vendorElement.innerHTML = `
    <div class="flex-grow-1">
      <div class="font-medium">${name}</div>
    </div>
    <div class="d-flex align-items-center">
      <div class="input-group input-group-sm" style="width: 150px;">
        <input type="number" class="form-control text-right vendor-amount" 
          placeholder="0.00" step="0.01" value="" 
          data-vendor-id="${vendorId}">
      </div>
      <div class="ms-2">
        <span class="remove-vendor" onclick="removeVendor('${vendorId}')">×</span>
      </div>
    </div>
  `;

    vendorListContainer.appendChild(vendorElement);

    // Add event listener to the new input
    const inputElement = vendorElement.querySelector(".vendor-amount");
    inputElement.addEventListener("change", function () {
      updateVendorAmount(vendorId, this.value);
    });

    calculateAll(); // Update totals
  }

  // Update vendor amount
  window.updateVendorAmount = function (vendorId, amount) {
    const vendor = vendors.find((v) => v.id === vendorId);
    if (vendor) {
      vendor.amount = parseFloat(amount) || 0;
      calculateAll();
    }
  };

  // Remove vendor
  window.removeVendor = function (vendorId) {
    const element = document.getElementById(vendorId);
    if (element) {
      element.remove();
      vendors = vendors.filter((v) => v.id !== vendorId);
      calculateAll();
    }
  };

  // Calculate all totals
  function calculateAll() {
    // Get input values for bag cash
    const bagCash =
      parseFloat(document.getElementById("bagCash").value) || 0;
    const paidOutCash =
      parseFloat(document.getElementById("paidOutCash").value) || 0;
    const grocery =
      parseFloat(document.getElementById("grocery").value) || 0;
    const gas = parseFloat(document.getElementById("gas").value) || 0;
    const gall = parseFloat(document.getElementById("gall").value) || 0;
    const rebate =
      parseFloat(document.getElementById("rebate").value) || 0;

    // Get receipts values
    const cashReceipts =
      parseFloat(document.getElementById("cashReceipts").value) || 0;
    const credit =
      parseFloat(document.getElementById("credit").value) || 0;
    const mobile =
      parseFloat(document.getElementById("mobile").value) || 0;
    const receiptsPaidOutCash =
      parseFloat(document.getElementById("receiptsPaidOutCash").value) ||
      0;

    // Calculate vendor total
    const vendorTotal = vendors.reduce(
      (sum, vendor) => sum + vendor.amount,
      0
    );

    // Calculate bag cash total correctly - include all values
    const bagCashTotal = grocery + gas + rebate;

    // Update the checks total (which is essentially the vendor total)
    document.getElementById("checksTotal").textContent =
      vendorTotal.toFixed(2);

    // Calculate receipts total - including the new receipts paid out cash
    const receiptsTotal =
      cashReceipts + credit + mobile + receiptsPaidOutCash;

    // Calculate short/over - properly comparing against the bag cash values
    const receiptsShortOver = receiptsTotal - bagCashTotal;

    // Update display values
    document.getElementById("bagCashTotal").textContent =
      bagCashTotal.toFixed(2);
    document.getElementById("vendorTotal").textContent =
      vendorTotal.toFixed(2);
    document.getElementById("receiptsTotal").textContent =
      receiptsTotal.toFixed(2);

    // Update summary
    document.getElementById("summaryBagCashTotal").textContent =
      bagCashTotal.toFixed(2);
    document.getElementById("summaryVendorTotal").textContent =
      vendorTotal.toFixed(2);
    document.getElementById("summaryReceiptsTotal").textContent =
      receiptsTotal.toFixed(2);
    document.getElementById("summaryShortOver").textContent =
      receiptsShortOver.toFixed(2);

    // Add color coding to short/over
    const shortOverElement = document.getElementById("summaryShortOver");

    if (receiptsShortOver < 0) {
      shortOverElement.classList.add("text-red-600");
      shortOverElement.classList.remove("text-green-600");
    } else if (receiptsShortOver > 0) {
      shortOverElement.classList.add("text-green-600");
      shortOverElement.classList.remove("text-red-600");
    } else {
      shortOverElement.classList.remove("text-red-600");
      shortOverElement.classList.remove("text-green-600");
    }
  }

  // Initialize calculations
  calculateAll();

  // Calculate on button click
  calculateBtn.addEventListener("click", calculateAll);

  // Auto-calculate when input changes
  const inputs = document.querySelectorAll('input[type="number"]');
  inputs.forEach((input) => {
    input.addEventListener("change", calculateAll);
    input.addEventListener("keyup", calculateAll);
    input.addEventListener("input", calculateAll); // Added additional listener for real-time updates
  });

  // Generate text report content
  function generateReportText() {
    const store = document.getElementById("storeLocation").value;
    const address = document.getElementById("storeAddress").value;
    const date = document.getElementById("reportDate").value;
    const reportNum = document.getElementById("reportNumber").textContent;

    let reportText = "";
    reportText += "==================================================\n";
    reportText += "           FASTRAC B DAILY FINANCIAL REPORT        \n";
    reportText +=
      "==================================================\n\n";
    reportText += `Report #: FTB-${reportNum}\n`;
    reportText += `Date: ${date}\n`;
    reportText += `Store: ${store}\n`;
    reportText += `Address: ${address}\n\n`;

    reportText += "--------------------------------------------------\n";
    reportText += "BAG CASH\n";
    reportText += "--------------------------------------------------\n";
    reportText += `Bag Cash:       $${formatMoney(
      document.getElementById("bagCash").value
    )}\n`;
    reportText += `Paid Out Cash:  $${formatMoney(
      document.getElementById("paidOutCash").value
    )}\n`;
    reportText += `Grocery:        $${formatMoney(
      document.getElementById("grocery").value
    )}\n`;
    reportText += `Gas:            $${formatMoney(
      document.getElementById("gas").value
    )}\n`;
    reportText += `Gall:           ${
      document.getElementById("gall").value
    }\n`;
    reportText += `Rebate:         $${formatMoney(
      document.getElementById("rebate").value
    )}\n`;
    reportText += `Total:          $${
      document.getElementById("bagCashTotal").textContent
    }\n\n`;

    reportText += "--------------------------------------------------\n";
    reportText += "VENDOR CHECKS\n";
    reportText += "--------------------------------------------------\n";
    vendors.forEach((vendor) => {
      reportText += `${vendor.name.padEnd(15)}: $${formatMoney(
        vendor.amount
      )}\n`;
    });
    reportText += `Total:          $${
      document.getElementById("vendorTotal").textContent
    }\n\n`;

    reportText += "--------------------------------------------------\n";
    reportText += "RECEIPTS SUMMARY\n";
    reportText += "--------------------------------------------------\n";
    reportText += `Cash:           $${formatMoney(
      document.getElementById("cashReceipts").value
    )}\n`;
    reportText += `Checks:         $${
      document.getElementById("checksTotal").textContent
    }\n`;
    reportText += `Credit:         $${formatMoney(
      document.getElementById("credit").value
    )}\n`;
    reportText += `Mobile:         $${formatMoney(
      document.getElementById("mobile").value
    )}\n`;
    reportText += `Paid Out Cash:  $${formatMoney(
      document.getElementById("receiptsPaidOutCash").value
    )}\n`;
    reportText += `Total:          $${
      document.getElementById("receiptsTotal").textContent
    }\n\n`;

    reportText += "--------------------------------------------------\n";
    reportText += "FINAL SUMMARY\n";
    reportText += "--------------------------------------------------\n";
    reportText += `Bag Cash Total:      $${
      document.getElementById("summaryBagCashTotal").textContent
    }\n`;
    reportText += `Vendor Checks Total: $${
      document.getElementById("summaryVendorTotal").textContent
    }\n`;
    reportText += `Receipts Total:      $${
      document.getElementById("summaryReceiptsTotal").textContent
    }\n`;
    reportText += `Short/Over:          $${
      document.getElementById("summaryShortOver").textContent
    }\n\n`;

    reportText += "==================================================\n";
    reportText += "Prepared by: _________________  Date: ____________\n";
    reportText += "Approved by: _________________  Date: ____________\n";
    reportText += "==================================================";

    return reportText;
  }

  // Download text report
  downloadBtn.addEventListener("click", function () {
    const reportContent = generateReportText();
    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = document.getElementById("reportDate").value;
    const reportNum = document.getElementById("reportNumber").textContent;

    a.href = url;
    a.download = `FastracB_Report_${reportNum}_${date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  });

  // Handle print functionality
  printBtn.addEventListener("click", function () {
    const printVersion = document.getElementById("printVersion");
    printVersion.classList.remove("hidden");
    // Update print version data
    document.getElementById("print-store").textContent =
      document.getElementById("storeLocation").value;
    document.getElementById("print-address").textContent =
      document.getElementById("storeAddress").value;
    document.getElementById("print-date").textContent =
      document.getElementById("reportDate").value;
    document.getElementById("print-report-number").textContent =
      document.getElementById("reportNumber").textContent;

    // Update all print fields
    document.getElementById("print-bagCash").textContent = formatMoney(
      document.getElementById("bagCash").value
    );
    document.getElementById("print-paidOutCash").textContent =
      formatMoney(document.getElementById("paidOutCash").value);
    document.getElementById("print-grocery").textContent = formatMoney(
      document.getElementById("grocery").value
    );
    document.getElementById("print-gas").textContent = formatMoney(
      document.getElementById("gas").value
    );
    document.getElementById("print-gall").textContent =
      document.getElementById("gall").value;
    document.getElementById("print-rebate").textContent = formatMoney(
      document.getElementById("rebate").value
    );
    document.getElementById("print-bagCashTotal").textContent =
      document.getElementById("bagCashTotal").textContent;

    document.getElementById("print-cashReceipts").textContent =
      formatMoney(document.getElementById("cashReceipts").value);
    document.getElementById("print-checksTotal").textContent =
      document.getElementById("checksTotal").textContent;
    document.getElementById("print-credit").textContent = formatMoney(
      document.getElementById("credit").value
    );
    document.getElementById("print-mobile").textContent = formatMoney(
      document.getElementById("mobile").value
    );
    document.getElementById("print-receiptsPaidOutCash").textContent =
      formatMoney(document.getElementById("receiptsPaidOutCash").value);
    document.getElementById("print-receiptsTotal").textContent =
      document.getElementById("receiptsTotal").textContent;

    // Print vendors

    const printVendorList = document.getElementById("print-vendorList");
    printVendorList.innerHTML = "";
    vendors.forEach((vendor) => {
      const row = document.createElement("tr");
      row.innerHTML = `
<td>${vendor.name}</td>
<td class="text-right">$${formatMoney(vendor.amount)}</td>
`;
      printVendorList.appendChild(row);
    });

    window.print();
    printVersion.classList.add("hidden");
  });
});
