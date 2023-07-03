<script>
    import {onDestroy, onMount} from "svelte";
    import {initializeSocket, websocket} from "$lib/socket.js";
    import {goto} from "$app/navigation";
    import enter from '../../assets/enter.svg'
    import user from '../../assets/user.svg'

    let socket
    let text = ""

    const unsubscribe = websocket.subscribe(val => socket = val)

    onMount(() => {
        initializeSocket()

        socket.emit({type: "getRooms", sender: socket.username}, (response) => {
            socket.rooms = response.payload
        })

        socket.emit({type: "getUsers", sender: socket.username}, (response) => {
            socket.users = response.payload
        })

        socket.on("broadcast/newRoom", (data) => {
            socket.rooms = {...socket.rooms, [data.payload.id]: data.payload}
        })

        socket.on("broadcast/removedRoom", (data) => {
            // eslint-disable-next-line no-unused-vars
            const {[data.payload.id]: cost, ...rest} = socket.rooms
            socket.rooms = rest
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
        <div class="flex justify-between w-full items-center">
        <form on:submit={handleSubmit} class="flex">
            <input type="text" value={text} on:input={(e) => text = e.target.value}
                   class="text-gray-900 px-2 text-xl rounded-l-lg"/>
            <button type="submit" class="bg-green-500 px-3 py-2 rounded-r-lg hover:bg-green-600">Create</button>
        </form>
            <div class="flex items-center gap-1">
                <p>{Object.keys(socket.users || []).length}</p>
                <img src={user} alt="online users"/>
            </div>
        </div>
        <div>
            <div class="grid grid-cols-3 items-center border-b border-gray-200 px-3 py-2">
                <p class="text-xl">Name</p>
                <p class="text-xl">Players</p>
            </div>
            <div>
                {#each Object.keys(socket.rooms || []) as room}
                    <div class="grid grid-cols-3 items-center px-3 py-2 border-b border-gray-200">
                        <p class="text-xl">{socket.rooms[room].id}</p>
                        <p class="text-xl">{socket.rooms[room].count} players</p>
                        <button class="flex gap-2 justify-self-end bg-green-500 hover:bg-green-600 rounded-lg px-3 py-2 w-fit"
                                on:click={() => handleJoin(socket.rooms[room].id)}>
                            Join
                            <img src={enter} alt="join"/>
                        </button>
                    </div>
                {/each}
            </div>
        </div>
    </div>
</div>
