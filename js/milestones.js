var milestoneData = {}

// milestoneBaseData и milestoneCategories генерируются build.py
// в js/milestones_data.js из content/milestones.json


function createMilestoneRequirements() {
    for (const key in milestoneBaseData) {
        const milestone = milestoneData[key]
        gameData.requirements[milestone.name] = new EssenceRequirement([getQuerySelector(milestone.name)],
            [{ requirement: milestone.expense }])
    }
}

function isNextMilestoneInReach() {
    const totalEssence = gameData.essence.add(getEssenceGain())

    for (const key in milestoneData) {
        const requirementObject = gameData.requirements[key]

        if (requirementObject instanceof EssenceRequirement) {
            if (!requirementObject.isCompleted()) {
                if (totalEssence.gte(requirementObject.requirements[0].requirement))
                    return true
            }
        }
    }
    return false
}