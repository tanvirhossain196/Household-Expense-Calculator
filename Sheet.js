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

  function updateMemberTable() {
    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";

    if (members.length === 0) {
      tbody.innerHTML = `<tr><td colspan="11">No members added yet</td></tr>`;
      return;
    }

    members.forEach((member, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${member.name}</td>
        <td>${member.rent.toFixed(2)}</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td><input type="checkbox" class="member-select"></td>
      `;
      tbody.appendChild(row);
    });
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
    const doc = new jsPDF();

    const rows = document.querySelectorAll("#tableBody tr");

    const data = Array.from(rows).map((row, index) => {
      const cells = row.querySelectorAll("td");
      const checkbox = row.querySelector(".member-select");

      return [
        index + 1, // Serial Number
        cells[1].textContent, // Name
        cells[2].textContent, // Rent
        cells[3].textContent,
        cells[4].textContent,
        cells[5].textContent,
        cells[6].textContent,
        cells[7].textContent,
        cells[8].textContent,
        cells[9].textContent,
        checkbox.checked ? "\u2713" : "", // Unicode for checkmark ✔
      ];
    });

    doc.autoTable({
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
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 120, 255] },
      footStyles: { fillColor: [0, 64, 128] },
    });

    // Add footer with text at the bottom corner
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.text("Created by Md. Tanvir Hossain", 150, pageHeight - 10);

    doc.save("household_expenses.pdf");
  }

  // Update updateMemberTable function
  function updateMemberTable() {
    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";

    if (members.length === 0) {
      tbody.innerHTML = `<tr><td colspan="12">No members added yet</td></tr>`;
      return;
    }

    members.forEach((member, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
      <td>${index + 1}</td>
      <td>${member.name}</td>
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
