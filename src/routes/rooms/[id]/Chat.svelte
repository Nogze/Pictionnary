<script>
    import {afterUpdate, beforeUpdate, onDestroy, onMount} from "svelte";
    import {initializeSocket, websocket} from "$lib/socket.js";

    export let room
    let messages = []
    let socket
    let text = ""
    let messagesDiv
    let autoscroll

    const unsubscribe = websocket.subscribe(val => socket = val)

    $: if (room?.messages) messages = [...room.messages]

    beforeUpdate(() => {
        autoscroll = messagesDiv && messagesDiv.offsetHeight + messagesDiv.scrollTop > messagesDiv.scrollHeight - 20;
    });

    afterUpdate(() => {
        if (autoscroll) messagesDiv.scrollTo(0, messagesDiv.scrollHeight);
    });

    onMount(() => {
        initializeSocket()

        socket.on("broadcast/message", (data) => {
            messages = [...messages, data.payload]
        })
    })

    onDestroy(() => {
        unsubscribe()
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        if (text.length === 0) return

        socket.emit({type: "message", payload: text, sender: socket.username})
        text = ""
    }

    const parseDate = (time) => {
        const date = new Date(time)
        return date.toLocaleTimeString()
    }
</script>

<div class="flex h-[500px] bg-gray-50 shadow-sm flex-col justify-between w-96">
    <div class="overflow-auto" bind:this={messagesDiv}>
        {#each messages as message}
            <div class="flex flex-col px-2 py-3 text-lg odd:bg-gray-200">
                <div class="flex gap-2 items-center">
                    <p class="text-gray-500 text-sm font-medium">{parseDate(message.time)}</p>
                    <p class="text-gray-900 font-bold">{message.sender}:</p>
                </div>
                <span class="text-gray-600 break-words">{message.text}</span>
            </div>
        {/each}
    </div>
    <form on:submit={handleSubmit} class="bg-gray-400 px-2 py-3 w-full flex">
        <input
                type="text"
                value={text}
                on:input={(e) => text = e.target.value}
                class="w-full rounded-l-lg text-lg text-gray-900 font-medium px-2"
        />
        <button type="submit" class="bg-green-500 hover:bg-green-600 px-3 py-2 rounded-r-lg font-medium text-lg">
            Send
        </button>
    </form>
</div>

