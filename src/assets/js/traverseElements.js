class svgElementController {
    // class that will be used to make an individual controller for each element and group of the SVG. This class will carry methods that will be used to edit properties of the elements and groups, as well as methods to add and remove elements and groups. It will also have a method to get the properties of the element or group.
    constructor(elId) {

        this.elId = elId;
        this.keyframes = [];

        /**
        this.element = element;
        
        this.element.id = elId;
        this.element.dataAnimId = elId;
        this.element.classList = this.element.classList ? this.element.classList : [];
        
        this.keyframes = [
            {time:0, transformRotate:0, transformTranslate:0, strokeWidth:10, strokeColor:'black'}, 
            {time:25, transformRotate:10, transformTranslate:10, strokeWidth:20, strokeColor:'red'}, 
            {time:50, transformRotate:20, transformTranslate:20, strokeWidth:1, strokeColor:'blue'}, 
            {time:75, transformRotate:30, transformTranslate:-10, strokeWidth:20, strokeColor:'green'}, 
            {time:100, transformRotate:0, transformTranslate:0, strokeWidth:1, strokeColor:'black'}
        ]; 
        this.keyframes=[]; */
        /** example keyframes, to test how the building will work. the keyframes need to be updated every time a new time is added to the animation. By keeping the values inside the controller, we can go through all of them every time we need to update the animation. 
        The keyframes will be used to build the css rules for the element or group. The keyframes will be an array of objects with the following structure: 
            {time: number, 
            transformRotate: number, 
            transformTranslate: number, 
            strokeWidth: number, 
            strokeColor: string}. 
        - The time will be a percentage of the total animation time. 
        - The transformRotate and transformTranslate will be used to build the transform property of the element or group. 
        - The strokeWidth and strokeColor will be used to build the stroke property of the element or group.
        */
    }
    init() {
        // Initialization code here
        //document.querySelector('#svgContents').appendChild(this.button);
        // this.changeStroke();
    }
    setStroke(color, width){
        this.element.setAttribute('stroke', color);
        this.element.setAttribute('stroke-width', width);
    }
    getStroke(){
        return {
            color: this.element.getAttribute('stroke'),
            strokeWidth: this.element.getAttribute('stroke-width')
        }
    }
    setKeyframes(keyframes) {
        this.keyframes = keyframes;

    }
    

    changeCssRules(targetEl, rulesToApply) {
        if (!targetEl) return;
        Object.entries(rulesToApply).forEach(([rule, value]) => {
            if (value !== '' && rule !== 'transform') targetEl.style.setProperty(rule, value);
        });

        let elStyle = targetEl.querySelector(':scope > style');
        if (!elStyle) {
            elStyle = document.createElement('style');
            targetEl.appendChild(elStyle);
        }

        const elClasses = targetEl.classList.length > 0
            ? '.' + Array.from(targetEl.classList).join('.')
            : '';

        const elAnimCss = `#${targetEl.id}${elClasses} {
            animation-name: ${targetEl.id}_anim;
            transform-origin: center;
            animation-duration: 5s;
            animation-timing-function: linear;
            animation-iteration-count: 1;
            animation-play-state: running;
        }`;

        elStyle.type = 'text/css';
        elStyle.innerHTML = elAnimCss;
    }
            
}
let elCounter = 0;

function traverseElements(element) {
    const elementData = {
        tag: element.tagName,
        id: element.id ? element.id : `el_${element.tagName.toLowerCase()}_${elCounter++}`,
        classList: Array.from(element.classList),
        children: []
    };
    //const currentDate = await new Date().getTime();

    
    if (!element.id) {
        element.id = elementData.id;
    }

    for (const child of Array.from(element.children)) {
        elementData.children.push(traverseElements(child));
    }

    return elementData;
}

export default traverseElements;