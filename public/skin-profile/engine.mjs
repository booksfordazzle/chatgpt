import {questions,activeQuestionIndices} from './questions.mjs';
export const profileIds=['M','A','C','B','E'];
export const habitIds=['cleanse','moisturize','sun','keep'];
export function selectedOptions(answer){return Array.isArray(answer)?[...answer]:[answer];}
export function validAnswer(answer,index){
 const q=questions[index];if(!q)return false;
 const values=selectedOptions(answer);
 if(Array.isArray(answer)&&!q.multiple)return false;
 if(!values.length||values.length>(q.maxChoices||1)||new Set(values).size!==values.length||values.some(v=>!Number.isInteger(v)||v<0||v>=q.options.length))return false;
 if(values.length>1&&(q.exclusive||[]).some(v=>values.includes(v)))return false;
 if((q.incompatible||[]).some(group=>group.filter(v=>values.includes(v)).length>1))return false;
 return true;
}
export function validQuizAnswers(answers){
 if(!Array.isArray(answers)||answers.length!==questions.length)return false;
 const omitted=questions.every((_,i)=>activeQuestionIndices.includes(i)||answers[i]===null);
 return questions.every((_,i)=>validAnswer(answers[i],i)||(omitted&&!activeQuestionIndices.includes(i)));
}
export function evaluate(answers){
 if(!validQuizAnswers(answers))throw Error('incomplete_answers');
 const original=['M','A','M','C','B','E'][answers[3]];
 const primary=selectedOptions(answers[1]).includes(3)||answers[5]===2?'C':original;
 const candidates=[primary!==original?original:null,(selectedOptions(answers[1]).some(v=>[1,2].includes(v))||answers[2]===0)?'M':null,answers[4]===2?'A':null,[1,2].includes(answers[2])?'B':null,[2,3].includes(answers[9])?'E':null];
 const secondary=candidates.find(p=>p&&p!==primary)||null;
 const habits=[];
 if(selectedOptions(answers[6]).some(v=>[1,3].includes(v)))habits.push('cleanse');
 if(answers[7]!==0)habits.push('moisturize');
 if(answers[8]!==null&&answers[8]!==0)habits.push('sun');
 if(answers[9]===0)habits.push('keep');
 return {primary,secondary,habits};
}
export function validResult(r){return r&&Object.keys(r).every(k=>['primary','secondary','habits'].includes(k))&&profileIds.includes(r.primary)&&(r.secondary===null||profileIds.includes(r.secondary)&&r.secondary!==r.primary)&&Array.isArray(r.habits)&&r.habits.length<=4&&new Set(r.habits).size===r.habits.length&&r.habits.every(h=>habitIds.includes(h));}
