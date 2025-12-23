const scrollUpAndExtract = () => {
    const chat = document.querySelector("div[role='list']") || document.querySelector("div[data-testid='conversation-container']");
    if (chat) {
        chat.scrollTop = 0;  // Scroll to top to load older messages
        setTimeout(extractMessages, scrollInterval);
    } else {
        console.error("Message container not found. Please ensure you are in the correct chat.");
        sendResponse({ messages, count: messages.length }); // Send current messages and count
    }
};

const extractMessages = () => {
    const elements = document.querySelectorAll("div.copyable-text");
    elements.forEach(el => {
        // Your existing message extraction logic...

        // Send messages to the Python server
        if (messageCount === 0 || chat.scrollHeight === lastScrollHeight) {
            console.log(`Finished extracting messages. Total: ${messages.length}`);

            // Send data to Python server
            fetch('http://localhost:5000/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(messages),
            })
            .then(response => response.json())
            .then(data => {
                // Process the response from the server
                console.log("Processed data:", data);
                displayProcessedData(data); // Call function to display processed data
            })
            .catch(error => console.error('Error sending data to server:', error));

            sendResponse({ messages, count: messages.length });
        } else {
            lastScrollHeight = chat.scrollHeight;
            scrollUpAndExtract();
        }
    });
    
};
