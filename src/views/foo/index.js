

import template from './index.html';

import './style.css';

export default class{
    mount(container){
        document.title = 'this is foo!';

        container.innerHTML=template;
       
    }
}