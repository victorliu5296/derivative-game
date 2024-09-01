import { socket } from './websocket.js';

export function setupRuleButtons() {
    const ruleButtons = [
        { id: 'powerRuleButton', rule: 'power' },
        { id: 'productRuleButton', rule: 'product' },
        { id: 'chainRuleButton', rule: 'chain' },
        { id: 'quotientRuleButton', rule: 'quotient' },
        { id: 'linearityRuleButton', rule: 'linearity' },
    ];

    ruleButtons.forEach(({ id, rule }) => {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', () => {
                socket.send(JSON.stringify({
                    type: 'applyRule',
                    rule: rule
                }));
                console.log(`${rule.charAt(0).toUpperCase() + rule.slice(1)} Rule clicked`);
            });
        }
    });
}

export function setupFunctionDerivativeButtons() {
    const derivativeButtons = [
        { id: 'exponentialFunctionButton', rule: 'exponential' },
        { id: 'logarithmicFunctionButton', rule: 'logarithmic' },
        { id: 'sineFunctionButton', rule: 'sine' },
        { id: 'cosineFunctionButton', rule: 'cosine' },
        { id: 'tangentFunctionButton', rule: 'tangent' },
        { id: 'inverseSineFunctionButton', rule: 'inverseSine' },
        { id: 'inverseCosineFunctionButton', rule: 'inverseCosine' },
        { id: 'inverseTangentFunctionButton', rule: 'inverseTangent' },
    ];

    derivativeButtons.forEach(({ id, rule }) => {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', () => {
                socket.send(JSON.stringify({
                    type: 'applyRule',
                    rule: rule
                }));
                console.log(`${rule} Function clicked`);
            });
        }
    });
}

export function setupWebSocketHandlers() {
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'derivativeResult') {
            if (data.result && data.result.error) {
                triggerErrorAnimation('currentFunction', data.result.error);
            } else {
                renderWithAnimation('currentFunction', data.result);
            }
        }

        if (data.type === 'newFunction') {
            renderWithAnimation('currentFunction', data.function);
        }

        if (data.type === 'message') {
            displayMessage(data.message);
        }
    };
}

function displayMessage(message) {
    const messagesElement = document.getElementById('messages');
    messagesElement.textContent = message;
}

function triggerErrorAnimation(elementId, errorMessage) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add('shake-error');
        setTimeout(() => element.classList.remove('shake-error'), 1000); // Remove animation after 1 second
    }
}

export function renderWithAnimation(elementId, latexString) {
    const element = document.getElementById(elementId);

    if (!element) {
        console.error(`Element with ID ${elementId} not found`);
        return;
    }

    element.textContent = ''; // Clear previous content

    // Remove the previous animation class if it's already there
    element.classList.remove('animate');

    latexString = formatForRendering(math.parse(latexString).toTex());
    // Render the LaTeX using KaTeX
    katex.render(latexString, element, {
        throwOnError: false
    });

    // Trigger reflow to restart the animation
    void element.offsetWidth;

    // Add the animation class to trigger the fade-in and scale-up animation
    element.classList.add('animate');
}

function formatForRendering(latex) {
    // Remove unnecessary multiplication by 1
    latex = latex.replace(/\b1\\cdot\s*/g, '');

    // Remove \cdot between a number and a function or expression in curly braces, including sin, cos, e^x
    latex = latex.replace(/(\d+)\\cdot\s*(\\?[\w{}^]+)/g, '$1$2');

    // Remove identity power operations like x^1 or {x}^{1}
    latex = latex.replace(/(\{?\w+\}?)(\^{\s*1\s*})/g, '$1');

    return latex;
}