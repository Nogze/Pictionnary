<script>
	import Canvas from './Canvas.svelte';
	import { onDestroy, onMount } from 'svelte';
	import { initializeSocket, websocket } from '$lib/socket.js';
	import Chat from './Chat.svelte';
	import Players from './Players.svelte';

	export let data;
	let socket;
	let room = {
		drawHistory: []
	};

	const unsubscribe = websocket.subscribe((val) => (socket = val));

	onMount(() => {
		initializeSocket();

		socket.emit({ type: 'getRoom', payload: data.id, sender: socket.username }, (response) => {
			room = response.payload;
		});

		socket.on('broadcast/joinRoom', (data) => {
			room = data.payload;
		});

		socket.on('broadcast/leaveRoom', (data) => {
			// eslint-disable-next-line no-unused-vars
			room = data.payload;
		});
	});

	onDestroy(() => {
		socket.emit({ type: 'leave', sender: socket.username });
		unsubscribe();
	});
</script>

<div class="flex flex-col items-center gap-10 mt-20">
	<h1 class="text-4xl text-center">Room {data.id}</h1>
	<div class="flex gap-4">
		<Players {room} />
		<Canvas drawHistory={room.drawHistory} />
		<Chat {room} />
	</div>
</div>
