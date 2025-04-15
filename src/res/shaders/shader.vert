    attribute vec4 aPosition;
    attribute vec3 aColor;

    varying vec3 vColor;

    void main()
    {
        gl_Position = aPosition;  // Använd aPosition istället för aPos
        vColor = aColor;  // Skicka färgen vidare till fragment-shadern
    }