// Joins class names, ignoring empty values: cn('a', false, 'b') -> 'a b'
export const cn = (...classes) => classes.filter(Boolean).join(' ')
