document.addEventListener("DOMContentLoaded", function () {
  let members = [];

  function addMember() {
    const nameInput = document.getElementById("memberName");
    const rentInput = document.getElementById("memberRent");
    const name = nameInput.value.trim();
    const rent = parseFloat(rentInput.value);

    if (name && !isNaN(rent) && rent >= 0) {
      members.push({ name, rent });
      nameInput.value = "";
      rentInput.value = "";
      updateMemberTable();
    } else {
      alert(
        "Please enter valid member details (Name and Rent amount required)"
      );
    }
  }

  function removeMember() {
    const removeInput = document.getElementById("removeMemberNumber");
    const removeIndex = parseInt(removeInput.value) - 1;

    if (
      !isNaN(removeIndex) &&
      removeIndex >= 0 &&
      removeIndex < members.length
    ) {
      members.splice(removeIndex, 1);
      removeInput.value = "";
      updateMemberTable();
    } else {
      alert("Invalid row number! Please enter a valid serial number.");
    }
  }

  function calculateShares() {
    const bills = {
      buwa: parseFloat(document.getElementById("buwaBill").value) || 0,
      gas: parseFloat(document.getElementById("gasBill").value) || 0,
      moylar: parseFloat(document.getElementById("moylarBill").value) || 0,
      wifi: parseFloat(document.getElementById("wifiBill").value) || 0,
      current: parseFloat(document.getElementById("currentBill").value) || 0,
    };

    if (members.length === 0) {
      document.getElementById("tableFooter").innerHTML = "";
      return;
    }

    const totalMembers = members.length;
    let totals = {
      bashaVara: 0,
      buwa: 0,
      gas: 0,
      moylar: 0,
      wifi: 0,
      current: 0,
    };

    const tbody = document.getElementById("tableBody");
    const rows = tbody.querySelectorAll("tr");

    members.forEach((member, index) => {
      const shares = {
        buwa: bills.buwa / totalMembers,
        gas: bills.gas / totalMembers,
        moylar: bills.moylar / totalMembers,
        wifi: bills.wifi / totalMembers,
        current: bills.current / totalMembers,
      };

      const totalWithoutBasha = Object.values(shares).reduce(
        (a, b) => a + b,
        0
      );
      const totalWithBasha = totalWithoutBasha + member.rent;

      const cells = rows[index].cells;
      cells[3].textContent = shares.buwa.toFixed(2);
      cells[4].textContent = shares.gas.toFixed(2);
      cells[5].textContent = shares.moylar.toFixed(2);
      cells[6].textContent = shares.wifi.toFixed(2);
      cells[7].textContent = shares.current.toFixed(2);
      cells[8].textContent = totalWithoutBasha.toFixed(2);
      cells[9].textContent = totalWithBasha.toFixed(2);

      totals.bashaVara += member.rent;
      totals.buwa += shares.buwa;
      totals.gas += shares.gas;
      totals.moylar += shares.moylar;
      totals.wifi += shares.wifi;
      totals.current += shares.current;
    });

    const tfoot = document.getElementById("tableFooter");
    tfoot.innerHTML = `
      <tr>
        <td>Total</td>
        <td>-</td>
        <td>${totals.bashaVara.toFixed(2)}</td>
        <td>${bills.buwa.toFixed(2)}</td>
        <td>${bills.gas.toFixed(2)}</td>
        <td>${bills.moylar.toFixed(2)}</td>
        <td>${bills.wifi.toFixed(2)}</td>
        <td>${bills.current.toFixed(2)}</td>
        <td>${(
          totals.buwa +
          totals.gas +
          totals.moylar +
          totals.wifi +
          totals.current
        ).toFixed(2)}</td>
        <td>${(
          totals.bashaVara +
          totals.buwa +
          totals.gas +
          totals.moylar +
          totals.wifi +
          totals.current
        ).toFixed(2)}</td>
        <td>-</td>
      </tr>
    `;
  }

  function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: "landscape", // Full-width in landscape mode
      unit: "mm",
      format: "a4",
    });

    // Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Household Expense Report", doc.internal.pageSize.width / 2, 15, {
      align: "center",
    });

    const rows = document.querySelectorAll("#tableBody tr");

    const data = Array.from(rows).map((row, index) => {
      const cells = row.querySelectorAll("td");
      const checkbox = row.querySelector(".member-select");

      return [
        index + 1, // Serial Number
        cells[1].textContent.trim(), // Name
        cells[2].textContent.trim(), // Rent
        cells[3].textContent.trim(),
        cells[4].textContent.trim(),
        cells[5].textContent.trim(),
        cells[6].textContent.trim(),
        cells[7].textContent.trim(),
        cells[8].textContent.trim(),
        cells[9].textContent.trim(),
        checkbox.checked ? "✔" : "", // Checkmark for selection
      ];
    });

    doc.autoTable({
      startY: 25, // Start table below title
      margin: { top: 20, left: 5, right: 5 }, // Use full page width
      styles: {
        fontSize: 10,
        cellPadding: 2,
        lineWidth: 0.2,
        lineColor: [0, 0, 0],
      },
      headStyles: {
        fillColor: [0, 120, 255],
        textColor: 255,
        fontStyle: "bold",
        halign: "center",
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" }, // S.No
        1: { cellWidth: 40, halign: "left" }, // Name
        2: { cellWidth: 25, halign: "right" }, // Rent
        3: { cellWidth: "auto", halign: "right" },
        4: { cellWidth: "auto", halign: "right" },
        5: { cellWidth: "auto", halign: "right" },
        6: { cellWidth: "auto", halign: "right" },
        7: { cellWidth: "auto", halign: "right" },
        8: { cellWidth: 30, halign: "right" }, // Total (Without Basha)
        9: { cellWidth: 30, halign: "right" }, // Total (With Basha)
        10: { cellWidth: 15, halign: "center" }, // Selected
      },
      theme: "grid",
      head: [
        [
          "S.No",
          "Member",
          "Basha Vara",
          "Buwa Bill",
          "Gas Bill",
          "Moylar Bill",
          "Wifi Bill",
          "Current Bill",
          "Total (Without Basha)",
          "Total (With Basha)",
          "Selected",
        ],
      ],
      body: data,
    });

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.text(
      "Created by Md. Tanvir Hossain",
      doc.internal.pageSize.width - 10,
      pageHeight - 10,
      {
        align: "right",
      }
    );

    doc.save("household_expenses.pdf");
  }

  // Update updateMemberTable function
  const colors = [
    "#1a73e8",
    "#e91e63",
    "#4caf50",
    "#ff9800",
    "#9c27b0",
    "#3f51b5",
    "#ff5722",
    "#795548",
    "#009688",
    "#cddc39",
  ]; // More colors added

  function updateMemberTable() {
    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";

    if (members.length === 0) {
      tbody.innerHTML = `<tr><td colspan="12">No members added yet</td></tr>`;
      return;
    }

    members.forEach((member, index) => {
      const color = colors[index % colors.length]; // Cycle through colors
      const row = document.createElement("tr");
      row.innerHTML = `
      <td>${index + 1}</td>
      <td>
        <div style="
          background-color: ${color}; 
          color: white; 
          font-weight: bold; 
          padding: 5px 10px; 
          border-radius: 5px; 
          display: inline-block; 
          text-align: center;
        ">
          ${member.name}
        </div>
      </td>
      <td>${member.rent.toFixed(2)}</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td><input type="checkbox" class="member-select"></td>
      <td>
        <button onclick="removeMember(${index})" class="remove-btn">Remove</button>
      </td>
    `;
      tbody.appendChild(row);
    });
  }

  // Update removeMember function
  function removeMember(index) {
    if (index >= 0 && index < members.length) {
      members.splice(index, 1);
      updateMemberTable();
      calculateShares();
    } else {
      alert("Invalid member selection!");
    }
  }

  window.addMember = addMember;
  window.calculateShares = calculateShares;
  window.generatePDF = generatePDF;
  window.removeMember = removeMember;
});
