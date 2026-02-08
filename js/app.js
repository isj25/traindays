// ==========================================
// RailBookingDate - Main Application Script
// Performance Optimized Version
// ==========================================

'use strict';

// Configuration
const BOOKING_CONFIG = {
    ADVANCE_DAYS: 60,
    CALENDAR_DAYS: 90,
    PICKER_DAYS: 120,
    BOOKING_OPEN_TIME: '8:00 AM',
    TATKAL_AC_TIME: '10:00 AM',
    TATKAL_SLEEPER_TIME: '11:00 AM'
};

// Cache DOM elements
let cachedElements = null;

function getElements() {
    if (!cachedElements) {
        cachedElements = {
            currentDateDisplay: document.getElementById('current-date-display'),
            calendarContainer: document.getElementById('calendar-container'),
            travelDateInput: document.getElementById('travel-date'),
            bookingInfo: document.getElementById('booking-info'),
            bookingMessage: document.getElementById('booking-message'),
            customCalendar: document.getElementById('custom-calendar'),
            bookingActions: document.getElementById('booking-actions'),
            copyBtn: document.getElementById('copy-btn'),
            shareBtn: document.getElementById('share-btn'),
            whatsappBtn: document.getElementById('whatsapp-btn'),
            calendarBtn: document.getElementById('calendar-btn'),
            bookNowBtn: document.getElementById('book-now-btn'),
            darkModeToggle: document.getElementById('dark-mode-toggle')
        };
    }
    return cachedElements;
}

// ==========================================
// Utility Functions
// ==========================================

// Cache today's date - recalculate only when needed
let cachedToday = null;
let cachedTodayTimestamp = 0;

function getIndianDate() {
    const now = Date.now();
    // Cache for 1 minute
    if (cachedToday && (now - cachedTodayTimestamp) < 60000) {
        return new Date(cachedToday);
    }

    const date = new Date();
    const indianDateStr = date.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    const [day, month, year] = indianDateStr.split('/');
    cachedToday = new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).getTime();
    cachedTodayTimestamp = now;
    return new Date(cachedToday);
}

function formatDateForDisplay(date) {
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

function formatDateLong(date) {
    return date.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// ==========================================
// Current Date Display
// ==========================================

function updateCurrentDate() {
    const elements = getElements();
    const today = getIndianDate();
    elements.currentDateDisplay.textContent = formatDateLong(today);
}

// ==========================================
// Countdown Timers
// ==========================================

let countdownInterval = null;

function getNextBookingTime(hour, minute = 0) {
    // Get current time in IST
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const istTime = new Date(utcTime + istOffset);

    // Create target time for today
    const target = new Date(istTime);
    target.setHours(hour, minute, 0, 0);

    // If target time has passed today, move to tomorrow
    if (istTime >= target) {
        target.setDate(target.getDate() + 1);
    }

    return target;
}

function getGeneralBookingDate(targetTime) {
    // General booking at 8 AM is for travel 60 days later
    const travelDate = new Date(targetTime);
    travelDate.setDate(travelDate.getDate() + BOOKING_CONFIG.ADVANCE_DAYS);
    return travelDate;
}

function getTatkalTravelDate(targetTime) {
    // Tatkal booking done today is for tomorrow's train
    const travelDate = new Date(targetTime);
    travelDate.setDate(travelDate.getDate() + 1);
    return travelDate;
}

function getTomorrowDate() {
    const today = getIndianDate();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
}

function formatCountdownDate(date) {
    const weekday = date.toLocaleDateString('en-IN', { weekday: 'long' });
    const dayMonth = date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short'
    });
    return `${weekday}, ${dayMonth}`;
}

function updateCountdowns() {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const istNow = new Date(utcTime + istOffset);

    const currentHour = istNow.getHours();
    const currentMinute = istNow.getMinutes();

    // Hide all countdowns before 6 AM
    const countdownSection = document.querySelector('.countdown-section');
    if (currentHour < 6) {
        if (countdownSection) {
            countdownSection.style.display = 'none';
        }
        return;
    } else {
        if (countdownSection) {
            countdownSection.style.display = 'block';
        }
    }

    // General Booking (8:00 AM) - always show countdown
    const generalTarget = getNextBookingTime(8, 0);
    const generalTravelDate = getGeneralBookingDate(generalTarget);
    updateCountdownDisplay('general', generalTarget, istNow, generalTravelDate, false);

    // Tatkal AC (10:00 AM)
    const tatkalACTarget = getNextBookingTime(10, 0);
    const tatkalACTravelDate = getTatkalTravelDate(tatkalACTarget);
    const showACCountdown = currentHour < 10;
    updateCountdownDisplay('tatkal-ac', tatkalACTarget, istNow, tatkalACTravelDate, !showACCountdown);

    // Tatkal Sleeper (11:00 AM)
    const tatkalSleeperTarget = getNextBookingTime(11, 0);
    const tatkalSleeperTravelDate = getTatkalTravelDate(tatkalSleeperTarget);
    const showSleeperCountdown = currentHour < 11;
    updateCountdownDisplay('tatkal-sleeper', tatkalSleeperTarget, istNow, tatkalSleeperTravelDate, !showSleeperCountdown);
}

function updateCountdownDisplay(type, target, now, travelDate, showOpenMessage) {
    const card = document.querySelector(`.countdown-${type}`);
    if (!card) return;

    const opensTextEl = document.getElementById(`${type === 'general' ? 'general' : type}-opens-text`);

    // If showing "open" message instead of countdown
    if (showOpenMessage) {
        const dateEl = document.getElementById(`${type === 'general' ? 'general-booking' : type}-date`);
        const timerEl = card.querySelector('.countdown-timer');

        if (dateEl) {
            if (type === 'tatkal-ac') {
                dateEl.innerHTML = `<strong style="color: var(--accent-open); font-size: 1.1rem;">✅ Tatkal AC Booking is OPEN!</strong>`;
            } else if (type === 'tatkal-sleeper') {
                dateEl.innerHTML = `<strong style="color: var(--accent-open); font-size: 1.1rem;">✅ Tatkal Sleeper Booking is OPEN!</strong>`;
            }
        }

        if (timerEl) {
            timerEl.style.display = 'none';
        }

        if (opensTextEl) {
            opensTextEl.style.display = 'none';
        }

        card.classList.remove('countdown-urgent');
        return;
    }

    // Show countdown units and label
    const timerEl = card.querySelector('.countdown-timer');
    if (timerEl) {
        timerEl.style.display = 'flex';
    }

    if (opensTextEl) {
        opensTextEl.style.display = 'block';
    }

    const diff = target.getTime() - now.getTime();

    if (diff <= 0) {
        // Time reached - will reset on next tick
        return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Update display elements
    const hoursEl = document.getElementById(`${type}-hours`);
    const minutesEl = document.getElementById(`${type}-minutes`);
    const secondsEl = document.getElementById(`${type}-seconds`);
    const dateEl = document.getElementById(`${type === 'general' ? 'general-booking' : type}-date`);

    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');

    if (dateEl) {
        dateEl.innerHTML = `🚂 Travel: <strong>${formatCountdownDate(travelDate)}</strong>`;
    }

    // Add urgency class when less than 5 minutes
    if (totalSeconds <= 300) { // 5 minutes
        card.classList.add('countdown-urgent');
    } else {
        card.classList.remove('countdown-urgent');
    }
}

function startCountdowns() {
    // Initial update
    updateCountdowns();

    // Update every second
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    countdownInterval = setInterval(updateCountdowns, 1000);
}

// ==========================================
// Optimized 90-Day Calendar Generation
// Uses DocumentFragment for batch DOM updates
// ==========================================

// Holiday Data for 2026
const HOLIDAYS_2026 = [
    { date: '2026-03-04', name: 'Holi Holiday' },
    { date: '2026-03-05', name: 'Holi Holiday' },
    { date: '2026-03-06', name: 'Holi Holiday' },
    { date: '2026-03-07', name: 'Holi Holiday' },
    { date: '2026-03-21', name: 'Id-ul-Fitr' },
    { date: '2026-03-26', name: 'Ram Navami', type: 'long-weekend' },
    { date: '2026-03-31', name: 'Mahavir Jayanti' },
    { date: '2026-04-03', name: 'Good Friday', type: 'long-weekend' },
    { date: '2026-05-01', name: 'Budha Purnima', type: 'long-weekend' },
    { date: '2026-05-27', name: 'Id-ul-Zuha (Bakrid)' },
    { date: '2026-06-26', name: 'Muharram', type: 'long-weekend' },
    { date: '2026-08-15', name: 'Independence Day' },
    { date: '2026-08-26', name: 'Milad-un-Nabi' },
    { date: '2026-08-28', name: 'Raksha Bandhan', type: 'long-weekend' },
    { date: '2026-09-04', name: 'Janmashtami', type: 'long-weekend' },
    { date: '2026-09-14', name: 'Ganesh Chaturthi', type: 'long-weekend' },
    { date: '2026-10-02', name: 'Mahatma Gandhi Birthday', type: 'long-weekend' },
    { date: '2026-10-19', name: 'Dussehra Holiday', type: 'long-weekend' },
    { date: '2026-10-20', name: 'Dussehra Holiday', type: 'long-weekend' },
    { date: '2026-10-21', name: 'Dussehra Holiday', type: 'long-weekend' },
    { date: '2026-10-22', name: 'Dussehra Holiday', type: 'long-weekend' },
    { date: '2026-10-23', name: 'Dussehra Holiday', type: 'long-weekend' },
    { date: '2026-10-24', name: 'Dussehra Holiday', type: 'long-weekend' },
    { date: '2026-11-09', name: 'Diwali Holiday', type: 'long-weekend' },
    { date: '2026-11-10', name: 'Diwali Holiday', type: 'long-weekend' },
    { date: '2026-11-11', name: 'Diwali Holiday', type: 'long-weekend' },
    { date: '2026-11-12', name: 'Diwali Holiday', type: 'long-weekend' },
    { date: '2026-11-13', name: 'Diwali Holiday', type: 'long-weekend' },
    { date: '2026-11-14', name: 'Diwali Holiday', type: 'long-weekend' },
    { date: '2026-11-24', name: 'Guru Nanak Birthday' },
    { date: '2026-12-25', name: 'Christmas', type: 'long-weekend' }
];

function generate2026Calendar() {
    const elements = getElements();
    const container = elements.calendarContainer;
    const today = getIndianDate();
    const todayTime = today.getTime();

    // Set min date for travel input
    const todayFormatted = today.getFullYear() + '-' +
        String(today.getMonth() + 1).padStart(2, '0') + '-' +
        String(today.getDate()).padStart(2, '0');
    elements.travelDateInput.setAttribute('min', todayFormatted);

    const sixtyDaysTime = todayTime + (BOOKING_CONFIG.ADVANCE_DAYS * 86400000);

    // Start from current month
    const startTime = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
    const endTime = new Date('2026-12-31T23:59:59+05:30').getTime();

    // Update booking info card
    const sixtyDaysLater = new Date(sixtyDaysTime);
    const day = sixtyDaysLater.getDate();
    const month = sixtyDaysLater.toLocaleDateString('en-IN', { month: 'long', timeZone: 'Asia/Kolkata' });
    const weekday = sixtyDaysLater.toLocaleDateString('en-IN', { weekday: 'long', timeZone: 'Asia/Kolkata' });
    elements.bookingInfo.innerHTML = `You can book tickets for travel up to <span class="highlight">${day} ${month}</span> (${weekday})`;

    // Group dates by month
    const months = [];
    let currentTime = startTime;

    while (currentTime <= endTime) {
        const currentDate = new Date(currentTime);
        const monthKey = currentDate.getFullYear() * 12 + currentDate.getMonth();

        let monthData = months.find(m => m.key === monthKey);
        if (!monthData) {
            monthData = {
                key: monthKey,
                name: currentDate.toLocaleDateString('en-IN', {
                    month: 'long',
                    year: 'numeric',
                    timeZone: 'Asia/Kolkata'
                }),
                days: []
            };
            months.push(monthData);
        }

        // Check for holiday
        const dateString = currentDate.getFullYear() + '-' +
            String(currentDate.getMonth() + 1).padStart(2, '0') + '-' +
            String(currentDate.getDate()).padStart(2, '0');

        const holiday = HOLIDAYS_2026.find(h => h.date === dateString);

        monthData.days.push({
            date: currentDate.getDate(),
            time: currentTime,
            dayOfWeek: currentDate.getDay(),
            holiday: holiday
        });

        currentTime += 86400000;
    }

    // Build DOM using DocumentFragment for better performance
    const fragment = document.createDocumentFragment();
    const dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    // Ensure tooltip element exists
    let tooltip = document.getElementById('calendar-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'calendar-tooltip';
        tooltip.className = 'calendar-tooltip';
        document.body.appendChild(tooltip);
    }

    const showTooltip = (e, text, type) => {
        tooltip.innerHTML = text;
        tooltip.className = `calendar-tooltip tooltip-${type} show`;

        // Position logic
        const rect = e.target.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        let top = rect.top - tooltipRect.height - 10 + window.scrollY;
        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2) + window.scrollX;

        // Prevent going off-screen
        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }

        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
    };

    const hideTooltip = () => {
        tooltip.classList.remove('show');
    };

    months.forEach((monthData, monthIndex) => {
        const monthDiv = document.createElement('div');
        monthDiv.className = 'month-section';

        const monthHeader = document.createElement('h3');
        monthHeader.className = 'month-header';
        monthHeader.textContent = monthData.name;
        monthDiv.appendChild(monthHeader);

        const calendarGrid = document.createElement('div');
        calendarGrid.className = 'calendar-grid';

        // Day headers
        for (let i = 0; i < 7; i++) {
            const headerCell = document.createElement('div');
            headerCell.className = 'day-header';
            headerCell.textContent = dayHeaders[i];
            calendarGrid.appendChild(headerCell);
        }

        // Empty cells for first week
        const firstDayOfWeek = monthData.days[0].dayOfWeek;
        for (let i = 0; i < firstDayOfWeek; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'day-cell empty';
            calendarGrid.appendChild(emptyCell);
        }

        // Day cells
        monthData.days.forEach(dayData => {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'day-cell';

            // Holiday styling
            if (dayData.holiday) {
                dayDiv.className += ' holiday-date';
                if (dayData.holiday.type === 'long-weekend') {
                    dayDiv.className += ' long-weekend-date';
                }
            }

            const dayNumber = document.createElement('span');
            dayNumber.className = 'day-number';
            dayNumber.textContent = dayData.date;
            dayDiv.appendChild(dayNumber);

            // Determine status
            let status = 'future';

            if (dayData.time < todayTime) {
                dayDiv.className += ' pass-date';
                status = 'past';
            } else if (dayData.time <= sixtyDaysTime) {
                dayDiv.className += ' next-60-days';
                if (dayData.time === todayTime) dayDiv.className += ' today';
                status = 'open';
            }

            // Bind tooltip events
            dayDiv.addEventListener('mouseenter', (e) => {
                let tooltipText = '';

                // Add holiday info first if present
                if (dayData.holiday) {
                    const typeLabel = dayData.holiday.type === 'long-weekend' ? 'Long Weekend' : 'Holiday';
                    const labelColor = dayData.holiday.type === 'long-weekend' ? '#ec4899' : '#eab308';
                    tooltipText += `<div style="margin-bottom:4px; font-weight:700; color:${labelColor}; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">🎉 ${dayData.holiday.name} (${typeLabel})</div>`;
                }

                if (status === 'past') {
                    tooltipText += '<strong>Travel Date Passed 🕰️</strong>';
                    showTooltip(e, tooltipText, 'past');
                } else if (status === 'open') {
                    const bookedDate = new Date(dayData.time - (BOOKING_CONFIG.ADVANCE_DAYS * 86400000));
                    tooltipText += `<strong>Booking is Open ✅</strong><br><span style="font-size:0.85em; opacity:0.9">Booking opened on ${formatDateForDisplay(bookedDate)}</span>`;
                    showTooltip(e, tooltipText, 'open');
                } else {
                    // Calculate open date
                    const bookingDate = new Date(dayData.time - (BOOKING_CONFIG.ADVANCE_DAYS * 86400000));
                    tooltipText += `Booking opens on:<br><strong>${formatDateLong(bookingDate)}</strong> 📅`;
                    showTooltip(e, tooltipText, 'future');
                }
            });

            dayDiv.addEventListener('mouseleave', hideTooltip);

            // Touch support for mobile tooltips
            dayDiv.addEventListener('touchstart', (e) => {
                // ... mobile logic same as mouseenter ...
                let tooltipText = '';
                if (dayData.holiday) {
                    tooltipText += `<div style="margin-bottom:4px; font-weight:700; color:#eab308;">🎉 ${dayData.holiday.name}</div>`;
                }

                if (status === 'past') {
                    tooltipText += '<strong>Travel Date Passed 🕰️</strong>';
                    showTooltip(e, tooltipText, 'past');
                } else if (status === 'open') {
                    tooltipText += '<strong>Booking is Open ✅</strong>';
                    showTooltip(e, tooltipText, 'open');
                } else {
                    const bookingDate = new Date(dayData.time - (BOOKING_CONFIG.ADVANCE_DAYS * 86400000));
                    tooltipText += `Booking opens on:<br><strong>${formatDateForDisplay(bookingDate)}</strong>`;
                    showTooltip(e, tooltipText, 'future');
                }
                setTimeout(hideTooltip, 3000);
            }, { passive: true });

            calendarGrid.appendChild(dayDiv);
        });

        // Fill remaining cells
        const totalCellsLast = firstDayOfWeek + monthData.days.length;
        const remainingCells = (7 - (totalCellsLast % 7)) % 7;
        for (let i = 0; i < remainingCells; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'day-cell empty';
            calendarGrid.appendChild(emptyCell);
        }

        monthDiv.appendChild(calendarGrid);
        fragment.appendChild(monthDiv);
    });

    // Single DOM update
    container.innerHTML = '';
    container.appendChild(fragment);
}

// ==========================================
// Custom Calendar Popup (Lazy Generated)
// ==========================================

let selectedTravelDate = null;

function generateCustomCalendar() {
    const elements = getElements();
    const customCalendar = elements.customCalendar;
    const today = getIndianDate();
    const todayTime = today.getTime();
    const endTime = todayTime + (BOOKING_CONFIG.PICKER_DAYS * 86400000);

    // Build calendar HTML using template strings (faster than DOM manipulation)
    const dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const months = [];
    let currentTime = todayTime;

    while (currentTime <= endTime) {
        const currentDate = new Date(currentTime);
        const monthKey = currentDate.getFullYear() * 12 + currentDate.getMonth();

        let monthData = months.find(m => m.key === monthKey);
        if (!monthData) {
            monthData = {
                key: monthKey,
                name: currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
                days: [],
                firstDayOfWeek: null
            };
            months.push(monthData);
        }

        if (monthData.firstDayOfWeek === null) {
            monthData.firstDayOfWeek = currentDate.getDay();
        }

        monthData.days.push({
            date: currentDate.getDate(),
            time: currentTime,
            disabled: currentTime < todayTime,
            isToday: currentTime === todayTime
        });

        currentTime += 86400000;
    }

    let html = '<div class="custom-calendar-wrapper">';
    html += '<div class="popup-header-row">';
    html += '<h3 class="calendar-picker-title">Select Date</h3>';
    html += '<button class="calendar-close-btn" aria-label="Close calendar">&times;</button>';
    html += '</div>';
    html += '<div class="calendar-scroll-content">';

    months.forEach(monthData => {
        html += '<div class="calendar-picker-month">';
        html += `<h4 class="calendar-picker-month-header">${monthData.name}</h4>`;
        html += '<div class="calendar-picker-grid">';

        // Headers
        dayHeaders.forEach(d => {
            html += `<div class="calendar-picker-header">${d}</div>`;
        });

        // Empty cells
        for (let i = 0; i < monthData.firstDayOfWeek; i++) {
            html += '<div class="calendar-picker-day disabled empty"></div>';
        }

        // Days
        monthData.days.forEach(dayData => {
            const classes = ['calendar-picker-day'];
            if (dayData.disabled) classes.push('disabled');
            if (dayData.isToday) classes.push('today');

            if (!dayData.disabled) {
                html += `<div class="${classes.join(' ')}" data-time="${dayData.time}" tabindex="0" role="button">${dayData.date}</div>`;
            } else {
                html += `<div class="${classes.join(' ')}">${dayData.date}</div>`;
            }
        });

        // Fill remaining
        const totalCells = 7 + monthData.firstDayOfWeek + monthData.days.length;
        const remainingCells = (7 - (totalCells % 7)) % 7;
        for (let i = 0; i < remainingCells; i++) {
            html += '<div class="calendar-picker-day disabled empty"></div>';
        }

        html += '</div></div>';
    });

    html += '</div></div>';

    customCalendar.innerHTML = html;
    customCalendar.classList.add('show');

    // Event delegation for date selection
    const scrollContent = customCalendar.querySelector('.calendar-scroll-content');
    scrollContent.onclick = handleCalendarClick;
    scrollContent.onkeydown = handleCalendarKeydown;

    // Close button
    customCalendar.querySelector('.calendar-close-btn').onclick = (e) => {
        e.stopPropagation();
        customCalendar.classList.remove('show');
    };
}

function handleCalendarClick(e) {
    const target = e.target;
    if (target.classList.contains('calendar-picker-day') && !target.classList.contains('disabled')) {
        selectDate(target);
    }
}

function handleCalendarKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
        const target = e.target;
        if (target.classList.contains('calendar-picker-day') && !target.classList.contains('disabled')) {
            e.preventDefault();
            selectDate(target);
        }
    }
}

function selectDate(target) {
    const elements = getElements();
    const time = parseInt(target.dataset.time);
    selectedTravelDate = new Date(time);
    elements.travelDateInput.value = formatDateForDisplay(selectedTravelDate);
    elements.customCalendar.classList.remove('show');
    handleDateSelection();
}

// ==========================================
// Date Selection Handler
// ==========================================

let bookingDateForCalendar = null;

function handleDateSelection() {
    if (!selectedTravelDate) return;

    const elements = getElements();
    const today = getIndianDate();
    const todayTime = today.getTime();
    const sixtyDaysTime = todayTime + (BOOKING_CONFIG.ADVANCE_DAYS * 86400000);
    const selectedTime = selectedTravelDate.getTime();

    // Reset calendar button visibility
    if (elements.calendarBtn) {
        elements.calendarBtn.style.display = 'none';
    }
    // Reset book now button visibility
    if (elements.bookNowBtn) {
        elements.bookNowBtn.style.display = 'none';
    }
    bookingDateForCalendar = null;

    // Check if booking opens today
    if (selectedTime === sixtyDaysTime) {
        const now = new Date();
        const currentHour = parseInt(now.toLocaleTimeString('en-IN', {
            timeZone: 'Asia/Kolkata',
            hour: 'numeric',
            hour12: false
        }));

        if (currentHour < 8) {
            elements.bookingMessage.innerHTML = `Booking opens <strong>today at ${BOOKING_CONFIG.BOOKING_OPEN_TIME}</strong>`;
            elements.bookingMessage.className = 'booking-message booking-future';
            elements.bookingActions.classList.add('show');
            // Don't show calendar for today - it's already here!
            return;
        }
    }

    if (selectedTime >= todayTime && selectedTime <= sixtyDaysTime) {
        elements.bookingMessage.textContent = 'Booking is open now! 🎉';
        elements.bookingMessage.className = 'booking-message booking-open';
        // Show Book Now button when booking is open
        if (elements.bookNowBtn) {
            elements.bookNowBtn.style.display = 'inline-flex';
        }
        // Update WhatsApp link
        updateWhatsAppLink();
    } else {
        const bookingDate = new Date(selectedTime - (BOOKING_CONFIG.ADVANCE_DAYS * 86400000));
        const bookingDay = bookingDate.getDate();
        const bookingMonth = bookingDate.toLocaleDateString('en-IN', { month: 'long' });
        const bookingWeekday = bookingDate.toLocaleDateString('en-IN', { weekday: 'long' });

        elements.bookingMessage.innerHTML = `Booking opens on <strong>${bookingDay} ${bookingMonth}</strong> (${bookingWeekday}) at ${BOOKING_CONFIG.BOOKING_OPEN_TIME}`;
        elements.bookingMessage.className = 'booking-message booking-future';

        // Show calendar button for future booking dates
        bookingDateForCalendar = bookingDate;
        if (elements.calendarBtn) {
            elements.calendarBtn.style.display = 'inline-flex';
        }
        // Update WhatsApp link
        updateWhatsAppLink();
    }

    elements.bookingActions.classList.add('show');
}

// ==========================================
// Copy & Share Functions
// ==========================================

function copyBookingInfo() {
    if (!selectedTravelDate) return;

    const today = getIndianDate();
    const todayTime = today.getTime();
    const sixtyDaysTime = todayTime + (BOOKING_CONFIG.ADVANCE_DAYS * 86400000);
    const selectedTime = selectedTravelDate.getTime();
    const travelDateStr = formatDateLong(selectedTravelDate);

    let text;
    if (selectedTime >= todayTime && selectedTime <= sixtyDaysTime) {
        text = `🚂 Train Travel: ${travelDateStr}\n✅ Booking is open now!\n\nCalculated via RailBookingDate.com`;
    } else {
        const bookingDate = new Date(selectedTime - (BOOKING_CONFIG.ADVANCE_DAYS * 86400000));
        const bookingDateStr = formatDateLong(bookingDate);
        text = `🚂 Train Travel: ${travelDateStr}\n📅 Booking opens: ${bookingDateStr} at ${BOOKING_CONFIG.BOOKING_OPEN_TIME}\n\nCalculated via RailBookingDate.com`;
    }

    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!');
    }).catch(() => {
        showToast('Failed to copy', true);
    });
}

function shareBookingInfo() {
    if (!selectedTravelDate) return;

    const today = getIndianDate();
    const todayTime = today.getTime();
    const sixtyDaysTime = todayTime + (BOOKING_CONFIG.ADVANCE_DAYS * 86400000);
    const selectedTime = selectedTravelDate.getTime();
    const travelDateStr = formatDateLong(selectedTravelDate);

    let text;
    if (selectedTime >= todayTime && selectedTime <= sixtyDaysTime) {
        text = `Train travel on ${travelDateStr} - Booking is open now!`;
    } else {
        const bookingDate = new Date(selectedTime - (BOOKING_CONFIG.ADVANCE_DAYS * 86400000));
        const bookingDateStr = formatDateLong(bookingDate);
        text = `Train travel on ${travelDateStr} - Booking opens ${bookingDateStr} at ${BOOKING_CONFIG.BOOKING_OPEN_TIME}`;
    }

    if (navigator.share) {
        navigator.share({
            title: 'Train Booking Date',
            text: text,
            url: window.location.href
        }).catch(() => { });
    } else {
        copyBookingInfo();
    }
}

function updateWhatsAppLink() {
    const elements = getElements();
    if (!elements.whatsappBtn || !selectedTravelDate) return;

    const today = getIndianDate();
    const todayTime = today.getTime();
    const sixtyDaysTime = todayTime + (BOOKING_CONFIG.ADVANCE_DAYS * 86400000);
    const selectedTime = selectedTravelDate.getTime();
    const travelDateStr = formatDateLong(selectedTravelDate);

    let message;
    if (selectedTime >= todayTime && selectedTime <= sixtyDaysTime) {
        message = `🚂 *Train Booking Alert!*

📅 *Travel Date:* ${travelDateStr}
✅ *Status:* Booking is OPEN now!

🎫 Book your tickets:
• IRCTC: https://www.irctc.co.in/nget/train-search

_Calculate booking dates at RailBookingDate.com_`;
    } else {
        const bookingDate = new Date(selectedTime - (BOOKING_CONFIG.ADVANCE_DAYS * 86400000));
        const bookingDateStr = formatDateLong(bookingDate);
        message = `🚂 *Train Booking Reminder*

📅 *Travel Date:* ${travelDateStr}
🗓️ *Booking Opens:* ${bookingDateStr}
⏰ *Time:* ${BOOKING_CONFIG.BOOKING_OPEN_TIME} IST

💡 *Pro Tip:* Be ready at 7:55 AM to book your tickets!

🎫 Book at: https://www.irctc.co.in/nget/train-search

_Calculate booking dates at RailBookingDate.com_`;
    }

    const encodedMessage = encodeURIComponent(message);
    elements.whatsappBtn.href = `https://wa.me/?text=${encodedMessage}`;
}

// ==========================================
// Add to Calendar Function
// ==========================================

function addToCalendar() {
    if (!bookingDateForCalendar || !selectedTravelDate) return;

    const travelDateStr = formatDateLong(selectedTravelDate);

    // Set event time to 7:55 AM IST on booking date
    const eventDate = new Date(bookingDateForCalendar);

    // Format date for calendar (YYYYMMDD)
    const year = eventDate.getFullYear();
    const month = String(eventDate.getMonth() + 1).padStart(2, '0');
    const day = String(eventDate.getDate()).padStart(2, '0');

    // Event at 7:55 AM IST (formatted as 075500)
    // End time 8:05 AM IST (10 min event)
    const startDateTime = `${year}${month}${day}T075500`;
    const endDateTime = `${year}${month}${day}T080500`;

    const eventTitle = `🚂 IRCTC Booking Opens - ${travelDateStr}`;
    const eventDescription = `Train ticket booking for ${travelDateStr} opens at 8:00 AM IST.\\n\\nBe ready at 7:55 AM to book your tickets!\\n\\nBook at: https://www.irctc.co.in\\n\\nCalculated via RailBookingDate.com`;

    // Try to detect if mobile and use appropriate method
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
        // For mobile, download .ics file which opens in default calendar
        downloadICSFile(eventTitle, eventDescription, startDateTime, endDateTime);
    } else {
        // Show options modal for desktop
        showCalendarOptions(eventTitle, eventDescription, startDateTime, endDateTime);
    }
}

function downloadICSFile(title, description, startDateTime, endDateTime) {
    // Create ICS file content
    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//RailBookingDate//IRCTC Booking Reminder//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `DTSTART;TZID=Asia/Kolkata:${startDateTime}`,
        `DTEND;TZID=Asia/Kolkata:${endDateTime}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${description.replace(/\\n/g, '\\n')}`,
        'LOCATION:IRCTC Website',
        `UID:${Date.now()}@railbookingdate.com`,
        'BEGIN:VALARM',
        'TRIGGER:-PT5M',
        'ACTION:DISPLAY',
        'DESCRIPTION:IRCTC booking opens in 5 minutes!',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    // Create and download file
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'irctc-booking-reminder.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Calendar event downloaded! 📅');
}

function showCalendarOptions(title, description, startDateTime, endDateTime) {
    // Create modal
    let modal = document.getElementById('calendar-modal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'calendar-modal';
    modal.className = 'calendar-modal';
    modal.innerHTML = `
        <div class="calendar-modal-content">
            <div class="calendar-modal-header">
                <h3>Add to Calendar</h3>
                <button class="calendar-modal-close" aria-label="Close">&times;</button>
            </div>
            <p class="calendar-modal-desc">Choose your calendar app:</p>
            <div class="calendar-modal-options">
                <a href="${getGoogleCalendarUrl(title, description, startDateTime, endDateTime)}" target="_blank" rel="noopener" class="calendar-option google">
                    <img src="https://www.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_31_2x.png" alt="Google Calendar" width="22" height="22" style="border-radius:4px;">
                    Google Calendar
                </a>
                <button class="calendar-option ics" id="download-ics-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M12 14v4m-2-2h4"/></svg>
                    Download .ics (Apple, Outlook)
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    modal.querySelector('.calendar-modal-close').onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    modal.querySelector('#download-ics-btn').onclick = () => {
        downloadICSFile(title, description, startDateTime, endDateTime);
        modal.remove();
    };
    modal.querySelector('.google').onclick = () => {
        setTimeout(() => modal.remove(), 100);
    };

    // Show modal
    requestAnimationFrame(() => modal.classList.add('show'));
}

function getGoogleCalendarUrl(title, description, startDateTime, endDateTime) {
    // Google Calendar expects dates in a specific format
    // Convert IST to UTC for Google (IST is UTC+5:30)
    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: title,
        dates: `${startDateTime}/${endDateTime}`,
        ctz: 'Asia/Kolkata',
        details: description.replace(/\\n/g, '\n'),
        location: 'https://www.irctc.co.in'
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// ==========================================
// Toast Notifications (Lightweight)
// ==========================================

let toastTimeout = null;

function showToast(message, isError = false) {
    let toast = document.getElementById('app-toast');

    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'app-toast';
        toast.setAttribute('role', 'alert');
        document.body.appendChild(toast);
    }

    if (toastTimeout) clearTimeout(toastTimeout);

    toast.textContent = message;
    toast.className = `toast ${isError ? 'toast-error' : 'toast-success'}`;

    // Force reflow for animation
    toast.offsetHeight;
    toast.classList.add('show');

    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// ==========================================
// Dark Mode Toggle
// ==========================================

function initDarkMode() {
    const toggle = getElements().darkModeToggle;
    if (!toggle) return;

    // Check if dark mode is already set (from inline script)
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    toggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');

    toggle.addEventListener('click', () => {
        const currentlyDark = document.documentElement.getAttribute('data-theme') === 'dark';

        if (currentlyDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            toggle.setAttribute('aria-pressed', 'false');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            toggle.setAttribute('aria-pressed', 'true');
        }
    });
}

// ==========================================
// Event Listeners & Initialization
// ==========================================

function init() {
    const elements = getElements();

    // Critical path - update immediately
    updateCurrentDate();
    initDarkMode();
    startCountdowns();

    // Non-critical - defer calendar generation
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => generate2026Calendar(), { timeout: 100 });
    } else {
        setTimeout(generate2026Calendar, 0);
    }

    // Travel date input
    elements.travelDateInput.addEventListener('click', (e) => {
        e.stopPropagation();
        generateCustomCalendar();
    });

    // Close calendar on outside click
    document.addEventListener('click', (event) => {
        const customCalendar = elements.customCalendar;
        if (!customCalendar.contains(event.target) &&
            !elements.travelDateInput.contains(event.target) &&
            customCalendar.classList.contains('show')) {
            customCalendar.classList.remove('show');
        }
    });

    // Escape key to close calendar
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elements.customCalendar.classList.contains('show')) {
            elements.customCalendar.classList.remove('show');
        }
    });

    // Register copy and share buttons
    if (elements.copyBtn) elements.copyBtn.onclick = copyBookingInfo;
    if (elements.shareBtn) elements.shareBtn.onclick = shareBookingInfo;

    // Visit Dropdown Logic
    const visitBtn = document.getElementById('visit-btn');
    const visitDropdown = document.getElementById('visit-dropdown');

    if (visitBtn && visitDropdown) {
        visitBtn.onclick = (e) => {
            e.stopPropagation();
            const isExpanded = visitBtn.getAttribute('aria-expanded') === 'true';
            visitBtn.setAttribute('aria-expanded', !isExpanded);
            visitDropdown.classList.toggle('show');
        };

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!visitBtn.contains(e.target) && !visitDropdown.contains(e.target)) {
                visitDropdown.classList.remove('show');
                visitBtn.setAttribute('aria-expanded', 'false');
            }
        });

        // Close dropdown on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && visitDropdown.classList.contains('show')) {
                visitDropdown.classList.remove('show');
                visitBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Copy, Share, and Calendar buttons
    // The previous copy/share button event listeners were replaced by the new block above.
    // This block now only handles the calendar button and the share button's display logic.
    if (elements.shareBtn) {
        if (!navigator.share) {
            elements.shareBtn.style.display = 'none';
        }
    }

    if (elements.calendarBtn) {
        elements.calendarBtn.addEventListener('click', addToCalendar);
        // Initially hidden, shown only for future booking dates
        elements.calendarBtn.style.display = 'none';
    }

    // Book Now button - initially hidden, shown only when booking is open
    if (elements.bookNowBtn) {
        elements.bookNowBtn.style.display = 'none';
    }

    // Register Service Worker (non-blocking)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js').catch(() => { });
        });
    }
}

// Run on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
