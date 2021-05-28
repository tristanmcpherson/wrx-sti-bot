import { readdirSync } from "fs";
import { Container } from "inversify";
import { buildProviderModule } from "inversify-binding-decorators";
import path from "path";

// god help us all
// container must be create and exported first
const container = new Container();
export default container;

// then we must manually import the commands
const commandDir = path.join(__dirname, "commands");
const files = readdirSync(commandDir);
files.filter(file => file.endsWith(".js")).forEach(file => {
    require(path.join(commandDir, file));
});

// then we build the provider module and load it into the container
container.load(buildProviderModule());
