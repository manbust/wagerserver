import { app, io, client, wagers } from './server';
import { Address } from '@ton/ton';

// Webhook endpoint for WagerMaster contract
app.post('/webhook/wagermaster', async (req, res) => {
  const { event, data } = req.body;

  if (event === 'NewWagerCreated') {
    const { wagerAddress } = data;
    await setupWagerWebhook(wagerAddress);
    await updateWagerInfo(wagerAddress);
  }

  res.sendStatus(200);
});

// Webhook endpoint for individual Wager contracts
app.post('/webhook/wager/:address', async (req, res) => {
  const { address } = req.params;
  const { event, data } = req.body;

  if (event === 'WagerUpdated') {
    await updateWagerInfo(address);
  }

  res.sendStatus(200);
});

async function setupWagerWebhook(wagerAddress: string) {
  // Set up a webhook for the new Wager contract
  // This is a placeholder - you'll need to implement this based on your blockchain provider's API
  console.log(`Setting up webhook for Wager contract at ${wagerAddress}`);
}

async function updateWagerInfo(wagerAddress: string) {
  try {
    const address = Address.parse(wagerAddress);
    const result = await client.callGetMethod(address, 'getWagerInfo');
    const stack = result.stack;

    const wager = {
      id: wagerAddress,
      master: stack.readAddress().toString(),
      deadline: Number(stack.readBigNumber()),
      description: stack.readString(),
      creator: stack.readAddress().toString(),
      totalYesAmount: stack.readBigNumber().toString(),
      totalNoAmount: stack.readBigNumber().toString(),
      result: stack.readBoolean() ? "yes" : "no"
    };

    wagers.set(wagerAddress, wager);
    io.emit('wagerUpdated', wager);
  } catch (error) {
    console.error('Error updating wager info:', error);
  }
}

// Initial setup: Get all existing wagers from WagerMaster
async function initializeWagers() {
  // This is a placeholder - you'll need to implement this based on your WagerMaster contract
  const wagerAddresses = await getAllWagerAddresses();
  for (const address of wagerAddresses) {
    await setupWagerWebhook(address);
    await updateWagerInfo(address);
  }
}

initializeWagers();