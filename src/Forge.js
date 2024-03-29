import { SUPERSTRUCTURES, WEAPONS, MODULES, SHIPSIMS, CAPACITORS, SENSORS, ENGINES, SHIELDS, SHIP_MODS } from "./Data";
import { getModCosts, modify } from './Mods';

export const getComponent = (superstructureId, masterList, componentId, modsWithLevels) => {
	const ss_type = SUPERSTRUCTURES.find(ss => ss.id === superstructureId).ss_type;
	const sublist = masterList
		.filter(component => component.ss_type === ss_type);
	sublist.sort((a, b) => a.price - b.price);
	let value = componentId;
	if (!sublist.find(component => component.id === componentId)) {
		value = sublist[0].id;
	}
	const baseComponent = masterList.find(component => component.id === value);
	return modify(baseComponent, masterList, modsWithLevels);
};

const getModulesFromList = (masterList, moduleIds) => {
	const modules = [];
	for (let i = 0; i < moduleIds.length; i++) {
		if (moduleIds[i] && moduleIds[i].id) {
			const module = masterList.find(module => module.id === moduleIds[i].id);
			modules.push({
				...moduleIds[i],
				...module,
			});
		}
	}
	return modules;
};

export const getModules = (superstructureId, moduleIds, mods) => {
	const superstructure = getComponent(superstructureId, SUPERSTRUCTURES, superstructureId, mods);
	const baseModules = getModulesFromList(MODULES, moduleIds);
	return baseModules.map(baseModule => modify(baseModule, MODULES, mods));
};

export const getWeapons = (superstructureId, moduleIds, mods) => {
	const superstructure = getComponent(superstructureId, SUPERSTRUCTURES, superstructureId, mods);
	const baseWeapons = getModulesFromList(WEAPONS, moduleIds);
	return baseWeapons.map(baseWeapon => modify(baseWeapon, WEAPONS, mods));
};

export const getMods = (mods) => mods.map(({ id, level }) => ({
	mod: SHIP_MODS.find((mod) => mod.id === id),
	level,
}));

export const getPointsUsed = (selected, masterList) =>
	selected.reduce((acc, { id }) => acc + masterList.find(module => module.id === id).size_points, 0);

export const getModPointsUsed = (selected) =>
	selected.reduce((acc, { level }) => acc + level, 0);

const ammoMultiplier = (hullOrShield, ammo) => {
	if (ammo === 'kinetic') {
		return 0.5;
	} else if (ammo === 'thermal' && hullOrShield === 'hull') {
		return 1.0;
	} else if (ammo === 'em' && hullOrShield === 'shield') {
		return 1.0;
	} else if (ammo === 'gravitic') {
		if (hullOrShield === 'hull') {
			return 0.67;
		}
		return 0.33;
	}
	return 0.0;
};

const isEnabled = ({ disabled }) => !disabled;
const sumPower = (acc, weapon) => acc + weapon.power;
const sumCycles = (acc, weapon) => acc + weapon.cycles;
const sumPrice = (acc, item) => acc + item.price;
const sumDps = ({ hullDamage, shieldDamage }, item) => ({
	hullDamage: hullDamage + (item.weapon_damage / (item.firing_speed || 1.0)) * ammoMultiplier('hull', item.ammo),
	shieldDamage: shieldDamage + (item.weapon_damage / (item.firing_speed || 1.0)) * ammoMultiplier('shield', item.ammo),
});
const sumAlphaStrike = ({ hullDamage, shieldDamage }, item) => ({
	hullDamage: hullDamage + item.weapon_damage * ammoMultiplier('hull', item.ammo),
	shieldDamage: shieldDamage + item.weapon_damage * ammoMultiplier('shield', item.ammo),
});

export const shipStats = ({ superstructure, capacitor, shield, sensor, engine, shipsim, weapons, modules, weaponPoints, modulePoints, mods }) => {
	const massUsed = superstructure.mass + capacitor.mass + shield.mass + sensor.mass + engine.mass + shipsim.mass;

	const thrustRatio = engine.thrust / massUsed;

	const weaponsEnabled = weapons.filter(isEnabled);
	const modulesEnabled = modules.filter(isEnabled);

	const maxPower = superstructure.power;
	const weaponPower = weaponsEnabled.reduce(sumPower, 0);
	const modulePower = modulesEnabled.reduce(sumPower, 0);
	const alphaStrike = weaponsEnabled.reduce(sumAlphaStrike, { hullDamage: 0, shieldDamage: 0 });
	const dps = weaponsEnabled.reduce(sumDps, { hullDamage: 0, shieldDamage: 0 });

	const health = {
		hull: superstructure.strength,
		shield: shield.strength,
	};

	const powerUsed = capacitor.power + shield.power + sensor.power + engine.power + shipsim.power + weaponPower + modulePower;
	const powerLeft = maxPower - powerUsed;

	const maxCycles = shipsim.cycles;
	const weaponCycles = weaponsEnabled.reduce(sumCycles, 0);
	const moduleCycles = modulesEnabled.reduce(sumCycles, 0);
	const cyclesLeft = maxCycles - weaponCycles - moduleCycles;

	const totalPrice = [
		superstructure,
		capacitor,
		shield,
		sensor,
		engine,
		shipsim,
		...weapons,
		...modules,
	].reduce(sumPrice, 0);

	return {
		massUsed,
		maxPower,
		powerLeft,
		health,
		alphaStrike,
		dps,
		thrustRatio,
		turnSpeed: `${superstructure.turn_time.toFixed(2)}s`,
		maxCycles,
		cyclesLeft,
		totalPrice,
		overModules: modulePoints > superstructure.modules.points,
		overWeapons: weaponPoints > superstructure.weapons.points,
		overModded: getModPointsUsed(mods) > 60,
		modCosts: getModCosts(superstructure.ss_type, mods),
	};
};