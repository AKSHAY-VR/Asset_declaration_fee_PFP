let feeChart = null;  // Variable to hold the chart instance

function calculateFee() {
    let submissionDate = new Date(document.getElementById('submissionDate').value);  
    const grossSalary = parseFloat(document.getElementById('grossSalary').value);
    const deadlineDate = new Date("2024-06-30");
    const AugustDate = new Date("2024-08-31");

    const errorMessage = document.getElementById('errorMessage');

    // Reset error message
    errorMessage.textContent = '';
    errorMessage.classList.add('hidden');

    if (isNaN(grossSalary) || isNaN(submissionDate.getTime())) {
        errorMessage.textContent = "Please enter valid values.";
        errorMessage.classList.remove('hidden');
        return;
    }

    if (grossSalary <= 0) {
        errorMessage.textContent = "Please enter a positive value for the monthly gross salary.";
        errorMessage.classList.remove('hidden');
        return;
    }

    let effectiveSubmissionDate;
    if (submissionDate > AugustDate) {
        effectiveSubmissionDate = AugustDate;
    } else {
        effectiveSubmissionDate = submissionDate;
    }

    const timeDifference = effectiveSubmissionDate - deadlineDate;
    const daysDelayed = Math.ceil(timeDifference / (1000 * 3600 * 24));

    let lateFee = 0;

    if (daysDelayed > 0 && daysDelayed <= 31) {
        lateFee = (grossSalary / 30) * daysDelayed;
    } else if (daysDelayed > 31) {
        const first31DaysFee = (grossSalary / 30) * 31;
        const remainingDaysFee = ((grossSalary * 6) / 30) * (daysDelayed - 31);
        lateFee = first31DaysFee + remainingDaysFee;
    }

    lateFee = Math.round(lateFee);
    const formattedFee = lateFee.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const multiple = lateFee > 0 ? (lateFee / grossSalary) : 0;

    let resultText = `${formattedFee}`;
    const feeElement = document.getElementById('fee');
    feeElement.style.color = lateFee > 0 ? 'red' : 'green'; // Conditional styling based on fee value

    if (submissionDate <= deadlineDate) {
        resultText += ". There's no late fee since you've submitted on time.";
    } else if (submissionDate <= AugustDate) {
        resultText += ` as of ${formatDate(submissionDate)}.`;
    } else {
        const offensefee = 12 * grossSalary;
        const fee = offensefee.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        resultText += ` up until 31st of August 2024. Under Section 90 (5) of the Act, not submitting the annual declaration by 1 September constitutes an offense. If convicted, you may face a fine of LKR ${fee} (equal to your last 12 months’ gross salary), imprisonment for up to one year, or both, subject to an investigation and successful prosecution by the Commission.`;
    }

    feeElement.textContent = resultText;
    document.getElementById('multiple').textContent = ` ${multiple.toFixed(2)}`;
    document.getElementById('result').classList.remove('hidden');
    generateForecast(grossSalary, deadlineDate);
    errorMessage.classList.add('hidden');
}

function formatDate(date) {
    const day = date.getDate();
    const month = date.toLocaleString('en-GB', { month: 'long' });
    const year = date.getFullYear();
    let suffix = 'th';
    if (day === 1 || day === 21 || day === 31) {
        suffix = 'st';
    } else if (day === 2 || day === 22) {
        suffix = 'nd';
    } else if (day === 3 || day === 23) {
        suffix = 'rd';
    }
    return `${day}${suffix} of ${month} ${year}`;
}

function generateForecast(grossSalary, deadlineDate) {
    const labels = [];
    const data = [];
    let maxFee = 0;

    for (let i = 1; i <= 61; i++) {
        let fee = 0;
        if (i <= 31) {
            fee = (grossSalary / 30) * i;
        } else {
            const first31DaysFee = (grossSalary / 30) * 31;
            const remainingDaysFee = ((grossSalary * 6) / 30) * (i - 31);
            fee = first31DaysFee + remainingDaysFee;
        }
        fee = Math.round(fee);
        labels.push(i + " days");
        data.push(fee);
        if (fee > maxFee) {
            maxFee = fee;
        }
    }

    const ctx = document.getElementById('feeChart').getContext('2d');
    if (feeChart) {
        feeChart.destroy();
    }
    feeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Forecasted Late Fee (LKR)',
                data: data,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Days delayed after the deadline'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Late Fee (LKR)'
                    }
                }
            }
        }
    });
}
