import {questions} from './questions.mjs';
export const profileIds=['M','A','C','B','E'];
export const habitIds=['cleanse','moisturize','sun','keep'];
export function evaluate(answers){
 if(!Array.isArray(answers)||answers.length!==questions.length||questions.some((q,i)=>!Number.isInteger(answers[i])||answers[i]<0||answers[i]>=q.options.length))throw Error('incomplete_answers');
 const original=['M','A','M','C','B','E'][answers[3]];
 const primary=answers[1]===3||answers[5]===2?'C':original;
 const candidates=[primary!==original?original:null,(answers[1]===1||answers[2]===0)?'M':null,answers[4]===2?'A':null,[1,2].includes(answers[2])?'B':null,[2,3].includes(answers[9])?'E':null];
 const secondary=candidates.find(p=>p&&p!==primary)||null;
 const habits=[];
 if([1,3].includes(answers[6]))habits.push('cleanse');
 if(answers[7]!==0)habits.push('moisturize');
 if(answers[8]!==0)habits.push('sun');
 if(answers[9]===0)habits.push('keep');
 return {primary,secondary,habits};
}
export function validResult(r){return r&&Object.keys(r).every(k=>['primary','secondary','habits'].includes(k))&&profileIds.includes(r.primary)&&(r.secondary===null||profileIds.includes(r.secondary)&&r.secondary!==r.primary)&&Array.isArray(r.habits)&&r.habits.length<=4&&new Set(r.habits).size===r.habits.length&&r.habits.every(h=>habitIds.includes(h));}
