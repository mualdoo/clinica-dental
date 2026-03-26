const { encrypt, decrypt } = require('./crypto-service');

const encryptInstance = (instance) => {
    const attributes = instance.constructor.rawAttributes;
    
    for (const key in attributes) {
        if (attributes[key].encrypt && instance.changed(key)) {
            const value = instance.getDataValue(key);
            instance.setDataValue(key, encrypt(value))
        }
    }
}

const decryptInstance = (result) => {
    if (!result) return;
    
    const instances = Array.isArray(result) ? result : [result];
    
    const attributes = instances[0].constructor.rawAttributes;
    
    instances.forEach(instance => {
        for (const key in attributes) {
            if (attributes[key].encrypt && instance[key]) {
                instance[key] = decrypt(instance[key]);
            }
        }
    });
};

module.exports = { encryptInstance, decryptInstance };