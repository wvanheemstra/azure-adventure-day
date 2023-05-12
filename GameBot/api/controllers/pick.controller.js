const PickStrategyFactory = require('../services/pickStrategyFactory.service');
const appInsights = require("applicationinsights");

const pick = async (req, res) => {
    var matchId = req.body.MatchId;
    var player1Name = req.body.Player1Name;
    var turn = req.body.Turn;
    if (player1Name == undefined || matchId == undefined) {
        res.status(400);
        res.send("Player1NamerId or MatchId undefined");
        return;
    }

    const strategyOption = process.env.PICK_STRATEGY || "RANDOM";
    const result = pickFromStrategy(strategyOption);

    // TODO: implement custom arcade intelligence here, see also ./GameBot/README.md for sample requests    
    // if (player1Name == "Dud" && turn == 0) {
    //    strategyOption = "CUSTOM";
    //    result.text = "rock";
    // }

    // Respond based on turn and corresponding turn’s opponent’s player value
    // See https://arstechnica.com/science/2014/05/win-at-rock-paper-scissors-by-knowing-thy-opponent/#:~:text=Therefore%2C%20this%20is%20the%20best,thing%20that%20you%20just%20played
    switch(turn) {
        case 0:
             console.log("Entering Switch Statement for turn of 0");
             // No previous turns, therefore no turns player 1 value present to respond to
             break;
        case 1:
            console.log("Entering Switch Statement for turn of 1"); 
            // One previous turn, therefore turns player 1 value(s) present to respond to
            strategyOption = "CUSTOM";
            switch(req.body.TurnsPlayer1Values[0]) {
                case "Paper":
                    // Scissors cut Paper
                    result.text  =  "scissors"
                    break;          
                case "Rock":
                    // Paper covers Rock
                    result.text  =  "paper";
                    break;
                case "Metal":
                    // Rock beats Metal
                    result.text  =  "rock";
                    break;
                case "Snap":
                    // Metal paralyses Snap
                    result.text  =  "metal";
                    break;
                case "Scissors":
                    // Snap enchants Scissors
                    result.text  =  "snap";
                    break;
                // switch with choose the first one, these paths will never be taken
                case "Scissors":
                    // Snap enchants Scissors
                    result.text  =  "snap";
                    break;
                case "Metal":
                    // Scissors cut Metal
                    result.text  =  "scissors";
                    break;
                case "Paper":
                    // Metal eats Paper
                    result.text  =  "metal";
                    break;
                case "Snap":
                    // Paper covers Snap
                    result.text  =  "paper";
                    break;
                case "Rock":
                    // Snap evaporates Rock
                    result.text  =  "snap";
                    break;
                case "Scissors":
                    // Rock destroys Scissors
                    result.text  =  "rock";
                    break;
                
                default:
                   // Do nothing special
            }
        default:
            console.log("Entering Switch Statement for turn more than 1");
            // More than one previous turn, therefore turns player value(s) present to respond to
            strategyOption = "CUSTOM";
            // Player2's last response
            var player2sLastResult = req.body.TurnsPlayer2Values[turn-1];
            // result.text should be what beats player2sLastResult
            switch(player2sLastResult) {
                case "Paper":
                    // Scissors cut Paper
                    result.text="scissors";
                    break;          
                case "Rock":
                    // Paper covers Rock
                    result.text="paper";
                    break;
                case "Metal":
                    // Rock beats Metal
                    result.text="rock";
                    break;
                case "Snap":
                    // Metal paralyses Snap
                    result.text="metal";
                    break;
                case "Scissors":
                    // Snap enchants Scissors
                    result.text="snap";
                    break;
                case "Scissors":
                    // Snap enchants Scissors
                    result.text="snap";
                    break;
                case "Metal":
                    // Scissors cut Metal
                    result.text="scissors";
                    break;
                case "Paper":
                    // Metal eats Paper
                    result.text="metal";
                    break;
                case "Snap":
                    // Paper covers Snap
                    result.text="paper";
                    break;
                case "Rock":
                    // Snap evaporates Rock
                    result.text="snap";
                    break;
                case "Scissors":
                    // Rock destroys Scissors
                    result.text="rock";
                    break;
                default:
                // Do nothing special
            }
    }    
    
    console.log('Against ' + player1Name + ', strategy ' + strategyOption + '  played ' + result.text);

    const applicationInsightsIK = process.env.APPINSIGHTS_INSTRUMENTATIONKEY;
    if (applicationInsightsIK) {
        if (appInsights && appInsights.defaultClient) {
            var client = appInsights.defaultClient;
            client.commonProperties = {
                strategy: strategyOption
            };
            client.trackEvent({
                name: "pick", properties:
                    { matchId: matchId, strategy: strategyOption, move: result.text, player: player1Name, bet: result.bet }
            });
        }
    }
    res.send({ "Move": result.text, "Bet": result.bet });
};

const pickFromStrategy = (strategyOption) => {
    const strategyFactory = new PickStrategyFactory();

    strategyFactory.setDefaultStrategy(strategyOption);
    const strategy = strategyFactory.getStrategy();
    return strategy.pick();
}

module.exports = {
    pick,
}
