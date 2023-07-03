<script>
    export let room
</script>

<div class="flex flex-col w-96 bg-white">
    {#each Object.keys(room?.clients || []) as player}
        <div class="px-2 py-3 odd:bg-gray-200 text-gray-900">
            <p class="font-medium">{room.clients[player].username}</p>
            <p>Score: {room.clients[player].score}</p>
        </div>
    {/each}
    <button on:click={() => console.log(room)}>Room</button>
</div>