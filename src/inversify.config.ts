import { readdirSync } from "fs";
import { Container } from "inversify";
import { buildProviderModule } from "inversify-binding-decorators";

// god help us all
// container must be create and exported first
const container = new Container();
export default container;

// then we must manually import the commands
const commandDir = __dirname + "\\commands";
const files = readdirSync(commandDir);
files.filter(f => f.endsWith(".js")).forEach(f => {
    require(`${commandDir}\\${f}`);
})

// then we build the provider module and load it into the container
container.load(buildProviderModule());
