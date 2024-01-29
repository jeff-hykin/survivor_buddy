let secondsSinceLastInteraction = 0
let listeners = []
setInterval(() => {
    secondsSinceLastInteraction += 0.1
    for (const each of listeners) {
        each()
    }
}, 100)

const logInteraction = ()=>{
    secondsSinceLastInteraction = 0
    for (const each of listeners) {
        each()
    }
}
export const fadeAfterNoInteraction = ({ baseDelaySeconds=6, opacityLossPerSecond=0.3, callback=()=>0, }) => {
    let opacity = 1
    listeners.push(()=>{
        if (secondsSinceLastInteraction <= baseDelaySeconds) {
            if (opacity != 1) {
                callback(1)
            }
            opacity = 1
        } else {
            if (opacity == 0) {
            } else {
                if (opacity <= 0) {
                    opacity = 0
                } else {
                    opacity -= (opacityLossPerSecond/10)
                }
                callback(opacity)
            }
        }
    })
    return logInteraction
}