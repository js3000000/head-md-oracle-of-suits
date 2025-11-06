function onboarding() {

    // afficher image
    image(backgroundImage, 0, 0, width, height);

    // afficher robot au centre
    push();
    translate(width / 2, height / 2 + 50, 0);
    model(robotModel);
}