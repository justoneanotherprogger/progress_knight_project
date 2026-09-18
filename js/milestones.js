var milestoneData = {}

// milestoneBaseData и milestoneCategories генерируются build.py
// в js/milestones_data.js из content/milestones.json


function createMilestoneRequirements() {
    for (const key in milestoneBaseData) {
        const milestone = milestoneData[key]
        gameData.requirements[key] = new EssenceRequirement([getQuerySelector(key)],
            [{ requirement: milestone.threshold }])
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