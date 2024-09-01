export const createConstant = (value) => ({ type: 'constant', value });
export const createVariable = (name) => ({ type: 'variable', name });
export const createBinaryOp = (operator, left, right) => ({ type: 'binary', operator, left, right });
export const createFunction = (name, argument) => ({ type: 'function', name, argument });
export const createDerivative = (expression) => ({ type: 'derivative', expression });