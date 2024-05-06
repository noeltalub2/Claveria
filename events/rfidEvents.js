const rfidEvents = (io) => {
	io.on("connection", (socket) => {
		console.log("A user connected");

		// Listen for RFID gate pass events
		socket.on("rfidEvent", (data) => {
			console.log(`RFID Event: ${data.event} - ${data.rfidTag}`);

			// Broadcast the event to all connected clients
			io.emit("rfidUpdate", data);
		});

		// Disconnect event
		socket.on("disconnect", () => {
			console.log("A user disconnected");
		});
	});
};

export default rfidEvents;
