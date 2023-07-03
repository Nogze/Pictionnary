<script>
    import {initializeSocket, websocket} from "$lib/socket.js";
    import {onDestroy, onMount} from "svelte";

    export let strokeStyle
    export let lineWidth
    export let drawHistory

    let socket
    let context
    let canvas
    let isDrawing = false
    let start = {x: null, y: null}
    let drawnCount = 0

    const unsubscribe = websocket.subscribe(val => socket = val)

    $: printLines(drawnCount, drawHistory.length)

    onMount(() => {
        initializeSocket()
        context = canvas.getContext("2d")
        context.lineWidth = lineWidth
        context.strokeStyle = strokeStyle

        socket.on("broadcast/draw", (data) => {
            drawHistory = [...drawHistory, data.payload]
        })
    })

    onDestroy(() => {
        unsubscribe()
    })

    const printLines = (from, to) => {
        for (let i = from; i < to; i++) {
            const {x1, y1, x2, y2, strokeStyle, lineWidth} = drawHistory[i]
            context.beginPath()
            context.strokeStyle = strokeStyle
            context.lineWidth = lineWidth

            context.moveTo(x1, y1)
            context.lineTo(x2, y2)
            context.closePath()
            context.stroke()
        }
    }

    const handleStartDrawing = (e) => {
        isDrawing = true
        const {x, y} = canvas.getBoundingClientRect()
        const drawX = e.clientX - x
        const drawY = e.clientY - y

        start = {x: drawX, y: drawY}
    }

    const handleStopDrawing = () => {
        isDrawing = false
    }

    const handleDraw = (e) => {
        if (!isDrawing) return
        const {x, y} = canvas.getBoundingClientRect()
        const drawX = e.clientX - x
        const drawY = e.clientY - y

        socket.emit({
            type: "draw",
            payload: {x1: start.x, y1: start.y, x2: drawX, y2: drawY, strokeStyle, lineWidth},
            sender: socket.username
        })

        start = {x: drawX, y: drawY}
    }

</script>

<canvas
        bind:this={canvas}
        on:mousedown={handleStartDrawing}
        on:mouseup={handleStopDrawing}
        on:mousemove={handleDraw}
        width={500}
        height={500}
        class="bg-white max-w-[500px] max-h-[500px]"
></canvas>
