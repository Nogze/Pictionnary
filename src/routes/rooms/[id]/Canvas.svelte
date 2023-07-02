<script>
    import {initializeSocket, websocket} from "$lib/socket.js";
    import {onDestroy, onMount} from "svelte";

    export let strokeStyle
    export let lineWidth

    let socket
    let context
    let canvas
    let isDrawing = false
    let start = {x: null, y: null}
    let initialized = false

    const unsubscribe = websocket.subscribe(val => socket = val)

    onMount(() => {
        initializeSocket()
        context = canvas.getContext("2d")
        context.lineWidth = lineWidth
        context.strokeStyle = strokeStyle
        context.beginPath()


        socket.on("broadcast/draw", (data) => {
            const {drawX, drawY, strokeStyle, lineWidth} = data.payload
            if (!start.x || !start.y)
                start = {x: drawX, drawY}
            context.strokeStyle = strokeStyle
            context.lineWidth = lineWidth

            if (!initialized)
                context.moveTo(start.x, start.y)
            context.lineTo(drawX, drawY)
            context.moveTo(start.x, start.y)
            context.stroke()

            start = {x: drawX, y: drawY}
            initialized = true
        })
    })

    onDestroy(() => {
        unsubscribe()
    })

    const handleStartDrawing = (e) => {
        isDrawing = true
        const {x, y} = canvas.getBoundingClientRect()
        const drawX = e.clientX - x
        const drawY = e.clientY - y

        start = {x: drawX, y: drawY}

        socket.emit({type: "draw", payload: {drawX, drawY, strokeStyle, lineWidth}, sender: socket.username})
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
            payload: {drawX, drawY, strokeStyle, lineWidth},
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
        class="bg-white"
        draggable="false"
></canvas>
