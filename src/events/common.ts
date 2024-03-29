import type { ArgsOf, Client } from 'discordx';
import { Discord, On, Once } from 'discordx';

@Discord()
export class Example {
  @On()
  interactionCreate([interaction]: ArgsOf<'interactionCreate'>, client: Client) {
    client.executeInteraction(interaction);
  }

  // @On()
  // async messageCreate([message]: ArgsOf<"messageCreate">, client: Client): Promise<void> {
  //   await client.executeCommand(message);
  // }

  // @On()
  // messageDelete([message]: ArgsOf<"messageDelete">, client: Client): void {
  //   console.log("Message Deleted", client.user?.username, message.content);
  // }

  @Once()
  async ready(_: unknown, client: Client): Promise<void> {
    // Synchronize applications commands with Discord
    await client.initApplicationCommands();
    console.debug('Bot started');
  }
}
