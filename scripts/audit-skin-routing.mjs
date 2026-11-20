import {evaluate,validResult} from '../public/skin-profile/engine.mjs';
import {questions} from '../public/skin-profile/questions.mjs';
const answers=Array(10).fill(0),counts={M:0,A:0,C:0,B:0,E:0};let checked=0;
function walk(i){if(i===10){const result=evaluate(answers);if(!validResult(result))throw Error('invalid result');if(result.primary==='C'&&answers[1]!==3&&answers[5]!==2&&answers[3]!==3)throw Error('unjustified calm');if(result.primary!=='C'&&(answers[1]===3||answers[5]===2))throw Error('missing comfort precaution');counts[result.primary]++;checked++;return;}for(let option=0;option<questions[i].options.length;option++){answers[i]=option;walk(i+1)}}
walk(0);console.log(JSON.stringify({checked,counts,unexpectedCalm:0,invalidResults:0},null,2));
