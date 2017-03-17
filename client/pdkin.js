RED.nodes.registerType('pdk in',{
    category: 'input',
    color: "#FFCC66",
    icon: "pdk.png",
    inputs: 0,
    outputs: 1,

    defaults: {
        creds: { type: "pdk-credentials", required: true },
        name: { value: "" },
        topic: { value: "pdk" },
        inputs: { value: 0 }
    },

    label: function() {
        if (this.name) {
            return this.name;
        }
        return "pdk";
    },

    labelStyle: function() {
        return this.name?"node_label_italic":"";
    }
});

