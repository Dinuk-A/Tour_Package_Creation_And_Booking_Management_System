const changeBg = () => {
    var images = [
        "sunset-beach.jpg",
        "still-fishing.jpg",
        "sigiriya.jpg",
        "teaplantation.jpg",
        "ella-bridge.jpg"
    ];

    var randomIndex = Math.floor(Math.random() * images.length);
    var randomImg = images[randomIndex];

    console.log("runs");

    document.body.style.backgroundImage = "url('images/" + randomImg + "')"
    document.body.style.backgroundSize = "cover"
    document.body.style.backgroundRepeat = "no-repeat"
    document.body.style.backgroundAttachment = "fixed"

};

window.addEventListener('load', changeBg);