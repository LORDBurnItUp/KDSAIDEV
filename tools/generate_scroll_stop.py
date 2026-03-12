import sys
import json

def generate_prompts(topic):
    """Generates 3 scroll-stopping prompts for the Content Lab."""
    prompt_a = f"MACRO CINEMATOGRAPHIC CLOSE-UP: A futuristic device for {topic} reflecting in a high-tech glass sphere. Hyper-realistic textures, vibrant lime neon accents (#BFF549), deep cosmic black background. 8k resolution, Unreal Engine 5 render style."
    prompt_b = f"EXPLOSION OF DIGITAL PARTICLES from a central crystal lattice representing {topic}. The lattice is translucent with internal lime glow. Extreme detail, depth of field, Ray tracing, cinematic volumetric lighting."
    prompt_c = f"SCENE START: A dark void, silent. SCENE TRANSITION: A sudden spark of lime LIGHT (#BFF549) creates a complex geometric pattern of {topic}. SCENE END: The pattern stabilizes into the Antigravity Logo. Smooth, fluid camera motion, 60fps."
    
    return {
        "A": prompt_a,
        "B": prompt_b,
        "C": prompt_c
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python tools/generate_scroll_stop.py <topic>")
        sys.exit(1)
    
    topic = " ".join(sys.argv[1:])
    prompts = generate_prompts(topic)
    print(json.dumps(prompts, indent=2))
