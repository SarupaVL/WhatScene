chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const startDate = new Date(request.startDate);
    const endDate = new Date(request.endDate);
    endDate.setHours(23, 59, 59); // Include messages till the end of the day

    let messages = new Set();
    let messageCount = 0;

    const scrollInterval = 2000;  // Time interval between scroll attempts
    let lastOldestMessageDate = null;  // Track the oldest message date from the previous scroll

    const scrollUpAndExtract = () => {
        window.scrollTo(0, 0); // Scroll to the top to load older messages
        setTimeout(extractMessages, scrollInterval); // Wait for messages to load
    };

    const extractMessages = () => {
        const elements = document.querySelectorAll('div.message-in, div.message-out');
        let oldestMessageDate = null;

        elements.forEach(el => {
            const timeElement = el.querySelector('div.copyable-text');
            const textElement = el.querySelector('span.selectable-text');

            if (timeElement && textElement) {
                const timeText = timeElement.getAttribute('data-pre-plain-text');
                const textContent = textElement.textContent;

                const match = timeText.match(/\[\d{2}:\d{2}, (\d{1,2})\/(\d{1,2})\/(\d{4})\]/);
                if (match) {
                    const messageDate = new Date(`${match[3]}-${match[2]}-${match[1]}`);

                    if (messageDate >= startDate && messageDate <= endDate) {
                        const messageEntry = `${timeText} ${textContent}`;
                        if (!messages.has(messageEntry)) {
                            messages.add(messageEntry);
                            messageCount++;
                            chrome.runtime.sendMessage({ count: messageCount, messages: Array.from(messages) });
                        }
                    }

                    if (!oldestMessageDate || messageDate < oldestMessageDate) {
                        oldestMessageDate = messageDate;
                    }
                }
            }
        });

        // Stop scrolling if we've reached the start date or messages are repeating
        if (oldestMessageDate && (oldestMessageDate <= startDate || oldestMessageDate === lastOldestMessageDate)) {
            console.log('Reached the date range or no new messages to load.');
            return;
        }

        lastOldestMessageDate = oldestMessageDate;
        scrollUpAndExtract();  // Continue scrolling up for older messages
    };

    scrollUpAndExtract();  // Start the scrolling and extraction process
});
