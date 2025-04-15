    varying mediump vec3 vColor;  // Ta emot färgen från vertex-shadern

    void main()
    {
        gl_FragColor = vec4(vColor, 1.0);  // Använd vColor istället för ourColor
    }