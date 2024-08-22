export const fragmentShader = `
precision mediump float;

uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uTime;
uniform sampler2D uTexture; 
uniform float uShift;
uniform float uAlpha;

varying vec2 vUv;

float noise(vec2 uv) {
    return fract(sin(uv.x * 113.0 + uv.y * 412.0) * 6339.0);
}

vec3 noiseSmooth(vec2 uv) {
    vec2 index = floor(uv);
    
    vec2 pq = fract(uv);
    pq = smoothstep(0.0, 1.0, pq);
     
    float topLeft = noise(index);
    float topRight = noise(index + vec2(1.0, 0.0));
    float top = mix(topLeft, topRight, pq.x);
    
    float bottomLeft = noise(index + vec2(0.0, 1.0));
    float bottomRight = noise(index + vec2(1.0, 1.0));
    float bottom = mix(bottomLeft, bottomRight, pq.x);
    
    return vec3(mix(top, bottom, pq.y));
}

void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord / uResolution.xy;
    uv.x *= uResolution.x / uResolution.y;

    uv.x += uShift; // in-out clouds animation

    // Movimento verticale leggero sull'asse y usando una funzione sinusoidale
    float wave = sin(uTime) * 0.01; // Frequenza e ampiezza del movimento
    uv.y += wave;

    // Adjust UV for noise effect
    uv += uMouse.xy / 20.0;
    uv.x += uTime / 40.0;
    
    vec2 uv2 = uv;
    uv2.x += 0.;
    
    vec2 uv3 = uv;
    uv3.x += 0.;
        
    vec3 col = noiseSmooth(uv * 4.);
    
    col += noiseSmooth(uv * 8.0) * 0.5;
    col += noiseSmooth(uv2 * 16.0) * 0.25;
    col += noiseSmooth(uv3 * 32.0) * 0.125;
    col += noiseSmooth(uv3 * 64.0) * 0.0625;
    
    col /= 1.3;
    
    // Make the noise more intense by scaling it up and applying a power function
    col = pow(col, vec3(1.5)); // Increase contrast and intensity
    col *= 1.; // Scale the brightness for a more pronounced effect

    col *= uAlpha; //opacity animating
    
    // Sample the texture using UV coordinates
    vec3 textureColor = texture2D(uTexture, vUv).rgb;
    
    // Mix the noise color with the texture color
    col = mix(textureColor, vec3(0.94), col); // Use the noise to create bright clouds
    
    // Output to screen with full opacity
    gl_FragColor = vec4(col, 1.0);
}
`;

export const vertexShader = `
    varying vec2 vUv;

    void main()
    {   
        vUv = uv;
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
    }
`;
