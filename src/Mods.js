import { CAPACITORS, ENGINES, SENSORS, SHIELDS, SHIPSIMS, SHIP_MODS, SUPERSTRUCTURES, WEAPONS } from "./Data";

const getModWithLevel = ({ mod, level }) => {
    const returned = SHIP_MODS.find((aMod) => aMod.id == mod.id);
    return {
        ...returned,
        parts: returned.parts[level - 1],
        effects: returned.effects[level - 1],
    };
};

const percentModify = (value, percentChange) => {
    const change = Math.ceil(value * percentChange / 100);
    return value + change;
}

const ATTENUATIONS = [
    'missile_attenuate',
    'turret_attenuate',
    'cannon_attenuate',
    'laser_attenuate',
];

const attenuationsMatch = (id, baseComponent) => `${baseComponent.weapon_type}_attenuate` === id;

const OPTIMIZATIONS = [
    'missile_optimize',
    'turret_optimize',
    'cannon_optimize',
    'laser_optimize',
];

const optimizationsMatch = (id, baseComponent) => `${baseComponent.weapon_type}_optimize` === id;

const modifyOnce = (baseComponent, masterList, modWithLevel) => {
    const { id } = modWithLevel.mod;
    console.log(id, masterList === SUPERSTRUCTURES);
    if (id == 'expanded_modulebay' && masterList === SUPERSTRUCTURES) {
        const [transferred] = getModWithLevel(modWithLevel).effects;
        const change = Math.ceil(baseComponent.weapons.points * transferred / 100);
        console.log('mod', transferred, change);
        return {
            ...baseComponent,
            weapons: {
                points: baseComponent.weapons.points - change,
            },
            modules: {
                points: baseComponent.modules.points + change,
            },
        };
    } else if (id == 'expanded_hardpoints' && masterList === SUPERSTRUCTURES) {
        const [transferred] = getModWithLevel(modWithLevel).effects;
        const change = Math.ceil(baseComponent.modules.points * transferred / 100);
        console.log('weap', transferred, change);
        return {
            ...baseComponent,
            weapons: {
                points: baseComponent.weapons.points + change,
            },
            modules: {
                points: baseComponent.modules.points - change,
            },
        };
    } else if (id === 'beacon_range' && masterList === SENSORS) {
        // TODO
        const [_beaconRange, powerCost] = getModWithLevel(modWithLevel).effects;
        return {
            ...baseComponent,
            power: percentModify(baseComponent.power, powerCost),
        };
    } else if (id === 'cargohold_optimizer' && masterList === SUPERSTRUCTURES) {
        // TODO
        const [_cargohold, modWeaponLoss] = getModWithLevel(modWithLevel).effects;
        return {
            ...baseComponent,
            weapons: {
                points: percentModify(baseComponent.weapons.points, modWeaponLoss),
            },
            modules: {
                points: percentModify(baseComponent.modules.points, modWeaponLoss),
            },
        };
    } else if (id === 'mass_reducer' && masterList === SUPERSTRUCTURES) {
        const [massChange] = getModWithLevel(modWithLevel).effects;
        return {
            ...baseComponent,
            mass: percentModify(baseComponent.mass, massChange),
        };
    } else if (id === 'turn_time' && masterList === SUPERSTRUCTURES) {
        const [turnTime, hull] = getModWithLevel(modWithLevel).effects;
        return {
            ...baseComponent,
            turn_time: percentModify(baseComponent.turn_time, turnTime),
            strength: percentModify(baseComponent.strength, hull),
        };
    } else if (id === 'max_speed' && masterList === ENGINES) {
        const [maxSpeed, powerCost] = getModWithLevel(modWithLevel).effects;
        return {
            ...baseComponent,
            // TODO
            maxSpeed: percentModify(1500, maxSpeed),
            power: percentModify(baseComponent.power, powerCost),
        };
    } else if (id === 'improved_compressors') {
        // TODO
        return baseComponent;
    } else if (id === 'improved_crushers') {
        // TODO
        return baseComponent;
    } else if (id === 'drag_reducer') {
        // TODO
        return baseComponent;
    } else if (id === 'drone_speed') {
        // TODO
        return baseComponent;
    } else if (id === 'scoop_capacity') {
        // TODO
        return baseComponent;
    } else if ((id === 'kinetic_dmg'
        || id === 'gravitic_dmg'
        || id === 'thermal_dmg'
        || id === 'em_dmg')
        && masterList === WEAPONS) {
        // TODO
        const [bonus, _malus] = getModWithLevel(modWithLevel).effects;
        return {
            ...baseComponent,
            weapon_damage: percentModify(baseComponent.weapon_damage, bonus),
        }
    } else if (ATTENUATIONS.includes(id) && attenuationsMatch(id, baseComponent) && masterList === WEAPONS) {
        const [capBonus, damPenalty] = getModWithLevel(modWithLevel).effects;
        return {
            ...baseComponent,
            capacitor: percentModify(baseComponent.capacitor, capBonus),
            weapon_damage: percentModify(baseComponent.weapon_damage, damPenalty),
        };
    } else if ((id === 'sensor_bulwark' && masterList === SENSORS)
        || (id === 'shipsim_bulwark' && masterList === SHIPSIMS)
        || (id === 'capacitor_bulwark' && masterList === CAPACITORS)
        || (id === 'engine_bulwark' && masterList === ENGINES)) {
        // TODO
        const [_healthBonus, massChange] = getModWithLevel(modWithLevel).effects;
        return {
            ...baseComponent,
            mass: percentModify(baseComponent.mass, massChange),
        };
    } else if (OPTIMIZATIONS.includes(id) && optimizationsMatch(id, baseComponent) && masterList === WEAPONS) {
        const [powerChange] = getModWithLevel(modWithLevel).effects;
        return {
            ...baseComponent,
            power: percentModify(baseComponent.power, powerChange),
        };
    } else if ((id === 'sensor_optimize' && masterList === SENSORS)
        || (id === 'shield_optimize' && masterList === SHIELDS)
        || (id === 'shipsim_optimize' && masterList === SHIPSIMS)
        || (id === 'capacitor_optimize' && masterList === CAPACITORS)
        || (id === 'engine_optimize' && masterList === ENGINES)) {
        // TODO
        const [powerChange, _healthPenalty] = getModWithLevel(modWithLevel).effects;
        return {
            ...baseComponent,
            power: percentModify(baseComponent.power, powerChange),
        };
    } else if (id === 'sensor_overclock' && masterList === SENSORS) {
        const [strength, powerCost] = getModWithLevel(modWithLevel).effects;
        return {
            ...baseComponent,
            // TODO
            strength: percentModify(baseComponent.strength, strength),
            power: percentModify(baseComponent.power, powerCost),
        };
    } else if (id === 'shipsim_overclock' && masterList === SENSORS) {
        const [strength, powerCost] = getModWithLevel(modWithLevel).effects;
        return {
            ...baseComponent,
            // TODO
            cycles: percentModify(baseComponent.cycles, strength),
            power: percentModify(baseComponent.power, powerCost),
        };
    } else if (id === 'capacitor_overclock' && masterList === SENSORS) {
        const [strength, powerCost] = getModWithLevel(modWithLevel).effects;
        return {
            ...baseComponent,
            // TODO
            kear: percentModify(baseComponent.kear, strength),
            power: percentModify(baseComponent.power, powerCost),
        };
    } else if (id === 'engine_overclock' && masterList === SENSORS) {
        const [strength, powerCost] = getModWithLevel(modWithLevel).effects;
        return {
            ...baseComponent,
            // TODO
            thrust: percentModify(baseComponent.thrust, strength),
            power: percentModify(baseComponent.power, powerCost),
        };
    } else if (id === 'hull_res_thermal') {
        // TODO
        return baseComponent;
    } else if (id === 'hull_res_gravitic') {
        // TODO
        return baseComponent;
    } else if (id === 'hull_res_kinetic') {
        // TODO
        return baseComponent;
    } else if (id === 'hull_augment' && masterList === SUPERSTRUCTURES) {
        const [strength, massChange] = getModWithLevel(modWithLevel).effects;
        return {
            ...baseComponent,
            strength: percentModify(baseComponent.strength, strength),
            mass: percentModify(baseComponent.mass, massChange),
        };
    } else if (id === 'shield_recharge' && masterList === SHIELDS) {
        const [recharge, powerCost] = getModWithLevel(modWithLevel).effects;
        return {
            ...baseComponent,
            recharge_time: percentModify(baseComponent.recharge_time, recharge),
            power: percentModify(baseComponent.power, powerCost),
        };
    } else if (id === 'shield_res_gravitic') {
        // TODO
        return baseComponent;
    } else if (id === 'shield_res_kinetic') {
        // TODO
        return baseComponent;
    } else if (id === 'shield_res_em') {
        // TODO
        return baseComponent;
    } else if (id === 'shield_recharge' && masterList === SHIELDS) {
        const [strength, powerCost] = getModWithLevel(modWithLevel).effects;
        return {
            ...baseComponent,
            strength: percentModify(baseComponent.strength, strength),
            power: percentModify(baseComponent.power, powerCost),
        };
    }
    return baseComponent;
};

const modify = (baseComponent, masterList, modsWithLevels) => {
    return modsWithLevels
        .reduce((component, modWithLevel) =>
            modifyOnce(component, masterList, modWithLevel),
            baseComponent);
};

export default modify;