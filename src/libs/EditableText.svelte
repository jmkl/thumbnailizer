<script>
    let show_tf = false;
    export let tf_value = "";
    let edittext = null;
    export let onTextChange = null;
    export let placeholder = "type something...";
</script>

<div class="flex flex-row items-center grow">
    <div
      on:dblclick={() => {show_tf = true;if(edittext)edittext.focus()}}
      class="bg-t-main text-white px-2 py-1 grow italic {show_tf
        ? 'hidden'
        : 'flex'}"
    >
      {tf_value == ""
        ? placeholder
        : tf_value}
    </div>
    <sp-textfield
    bind:this={edittext}
      on:mouseleave={() => {
        show_tf = false;
      }}
      size="s"
      on:change={()=>{
        if(onTextChange)onTextChange()
      }}
      value={tf_value}
      on:input={(e) => {
        tf_value = e.target.value;
    
      }}
      quiet
      type="text"
      class="text-sm grow {show_tf ? 'flex' : 'hidden'}"
    >
    </sp-textfield>
  
  </div>