import { writable } from 'svelte/store';
import { generateRequestId } from '$lib/utils.js';

export const websocket = writable(null);
let socketInstance = null;

export const initializeSocket = () => {
	if (socketInstance) return websocket.set(socketInstance);

	const socket = new WebSocket('ws://localhost:8000');

	socket.on = (type, callback) => socket.addEventListener(type, (e) => callback(e.detail));

	socket.emit = async (action, callback) => {
		const { type, payload, sender } = action;
		const id = generateRequestId();
		const data = JSON.stringify({
			id,
			type,
			payload,
			sender
		});

		const handleResponse = (e) => {
			const responseData = JSON.parse(e.data);

			if (responseData.id === id) {
				socket.removeEventListener('message', handleResponse);
				if (typeof callback === 'function') callback(responseData);
			}
		};

		socket.addEventListener('message', handleResponse);
		socket.send(data);
	};

	socket.onmessage = (message) => {
		const { id, payload, type, status, sender } = JSON.parse(message.data);

		const event = new CustomEvent(type, { detail: { id, type, payload, status, sender } });
		socket.dispatchEvent(event);
	};

	websocket.set(socket);
	socketInstance = socket;
};
