<script>
	import { initializeSocket, websocket } from '$lib/socket.js';
	import { onDestroy, onMount } from 'svelte';

	const strokeStyles = ['#FFFFCC', '#87CEEB', '#98FF98', '#E6E6FA', '#F8B8C4'];
	const lineWidths = [1, 2, 3, 4, 5];

	export let drawHistory;

	let socket;

	let strokeStyle = strokeStyles[0];
	let lineWidth = lineWidths[0];
	let context;
	let canvas;
	let isDrawing = false;
	let start = { x: null, y: null };
	let drawnCount = 0;

	const unsubscribe = websocket.subscribe((val) => (socket = val));

	$: printLines(drawnCount, drawHistory.length);

	onMount(() => {
		initializeSocket();
		context = canvas.getContext('2d');
		context.lineWidth = lineWidth;
		context.strokeStyle = strokeStyle;

		socket.on('broadcast/draw', (data) => {
			drawHistory = [...drawHistory, data.payload];
		});
	});

	onDestroy(() => {
		unsubscribe();
	});

	const printLines = (from, to) => {
		for (let i = from; i < to; i++) {
			const { x1, y1, x2, y2, strokeStyle, lineWidth } = drawHistory[i];
			context.beginPath();
			context.strokeStyle = strokeStyle;
			context.lineWidth = lineWidth;

			context.moveTo(x1, y1);
			context.lineTo(x2, y2);
			context.closePath();
			context.stroke();
		}
	};

	const handleStartDrawing = (e) => {
		isDrawing = true;
		const { x, y } = canvas.getBoundingClientRect();
		const drawX = e.clientX - x;
		const drawY = e.clientY - y;

		start = { x: drawX, y: drawY };
	};

	const handleStopDrawing = () => {
		isDrawing = false;
	};

	const handleDraw = (e) => {
		if (!isDrawing) return;
		const { x, y } = canvas.getBoundingClientRect();
		const drawX = e.clientX - x;
		const drawY = e.clientY - y;

		socket.emit({
			type: 'draw',
			payload: { x1: start.x, y1: start.y, x2: drawX, y2: drawY, strokeStyle, lineWidth },
			sender: socket.username
		});

		start = { x: drawX, y: drawY };
	};
</script>

<div class="flex flex-col">
	<canvas
		bind:this={canvas}
		on:mousedown={handleStartDrawing}
		on:mouseup={handleStopDrawing}
		on:mousemove={handleDraw}
		width={500}
		height={500}
		class="bg-white max-w-[500px] max-h-[500px]"
	/>
	<div
		class="flex items-center justify-between w-full h-10 gap-4 px-4 bg-gray-500 border-t border-gray-200"
	>
		<div class="flex gap-2">
			{#each strokeStyles as ss}
				<button
					on:click={() => (strokeStyle = ss)}
					style={`background: ${ss};`}
					class="w-6 h-6 rounded-full"
				/>
			{/each}
		</div>
		<div class="flex gap-2">
			{#each lineWidths as lw}
				<button
					on:click={() => (lineWidth = lw)}
					class="flex items-center justify-center w-6 h-6 bg-white border-gray-200 rounded-full"
				>
					<div style={`width: ${lw * 2}px; height: ${lw * 2}px;`} class="bg-black rounded-full" />
				</button>
			{/each}
		</div>
	</div>
</div>
