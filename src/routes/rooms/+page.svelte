<script>
    import {onDestroy, onMount} from "svelte";
    import {initializeSocket, websocket} from "$lib/socket.js";
    import enter from '../../assets/enter.svg'
    import {goto} from "$app/navigation";

    let socket
    let rooms = {}
    let text = ""

    const unsubscribe = websocket.subscribe(val => socket = val)

    onMount(async () => {
        initializeSocket()

        socket.emit({type: "getRooms", sender: socket.username}, (response) => {
            rooms = response.payload
        })

        socket.on("broadcast/newRoom", (data) => {
            rooms = {...rooms, [data.payload.id]: data.payload}
        })

        socket.on("broadcast/removedRoom", (data) => {
            // eslint-disable-next-line no-unused-vars
            const {[data.payload.id]: cost, ...rest} = rooms
            rooms = rest
        })
    })

    onDestroy(() => {
        unsubscribe()
    })

    const handleJoin = (id) => {
        socket.emit({type: "join", payload: id, sender: socket.username}, (response) => {
            if (!response.status) return
            goto(`/rooms/${response.payload.id}`)

        })
    }

    const handleSubmit = () => {
        socket.emit({type: "join", payload: text, sender: socket.username}, (response => {
            if (!response.status) return
            goto(`/rooms/${response.payload.id}`)
        }))
    }
</script>

<div class="mt-20 px-4 max-w-3xl mx-auto">
    <h1 class="text-4xl font-semibold text-center">Welcome back, {socket?.username} !</h1>
    <div class="mt-10 flex flex-col gap-5">
        <form on:submit={handleSubmit} class="flex">
            <input type="text" value={text} on:input={(e) => text = e.target.value}
                   class="text-gray-900 px-2 text-xl rounded-l-lg"/>
            <button type="submit" class="bg-green-500 px-3 py-2 rounded-r-lg hover:bg-green-600">Create</button>
        </form>
        <div>
            <div class="grid grid-cols-3 items-center border-b border-gray-200 px-3 py-2">
                <p class="text-xl">Name</p>
                <p class="text-xl">Players</p>
            </div>
            <div>
                {#each Object.keys(rooms || []) as room}
                    <div class="grid grid-cols-3 items-center px-3 py-2 border-b border-gray-200">
                        <p class="text-xl">{rooms[room].id}</p>
                        <p class="text-xl">{rooms[room].count} players</p>
                        <button class="flex gap-2 self-end bg-green-500 hover:bg-green-600 rounded-lg px-3 py-2 w-fit"
                                on:click={() => handleJoin(rooms[room].id)}>
                            <p>Join</p>
                            <img src={enter} alt="join"/>
                        </button>
                    </div>
                {/each}
            </div>
        </div>
    </div>
</div>
