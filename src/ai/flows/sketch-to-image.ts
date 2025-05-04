// Sketch-to-Image Conversion [GenAI, UI]: Use a generative AI tool to convert the sketch into a refined image based on user prompts, while applying edge detection from OpenCV to inform the generative model.

'use server';

/**
 * @fileOverview Converts a sketch to an image based on a text prompt.
 *
 * - sketchToImage - A function that handles the sketch-to-image conversion process.
 * - SketchToImageInput - The input type for the sketchToImage function.
 * - SketchToImageOutput - The return type for the sketchToImage function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SketchToImageInputSchema = z.object({
  sketchDataUri: z
    .string()
    .describe(
      'A sketch as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Corrected typo here
    ),
  prompt: z.string().describe('A text prompt to guide the image generation.'),
});
export type SketchToImageInput = z.infer<typeof SketchToImageInputSchema>;

const SketchToImageOutputSchema = z.object({
  generatedImageDataUri: z
    .string()
    .describe(
      'The generated image as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Corrected typo here
    ),
});
export type SketchToImageOutput = z.infer<typeof SketchToImageOutputSchema>;

export async function sketchToImage(input: SketchToImageInput): Promise<SketchToImageOutput> {
  return sketchToImageFlow(input);
}

const sketchToImagePrompt = ai.definePrompt({
  name: 'sketchToImagePrompt',
  input: {
    schema: z.object({
      sketchDataUri: z
        .string()
        .describe(
          'A sketch as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
        ),
      prompt: z.string().describe('A text prompt to guide the image generation.'),
    }),
  },
  output: {
    schema: z.object({
      generatedImageDataUri: z
        .string()
        .describe(
          'The generated image as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
        ),
    }),
  },
  prompt: `Generate a refined image based on the following sketch and prompt.\n\nSketch: {{media url=sketchDataUri}}\n\nPrompt: {{{prompt}}}`,
});

const sketchToImageFlow = ai.defineFlow<
  typeof SketchToImageInputSchema,
  typeof SketchToImageOutputSchema
>({
  name: 'sketchToImageFlow',
  inputSchema: SketchToImageInputSchema,
  outputSchema: SketchToImageOutputSchema,
},
  async input => {
    // Use Gemini 2.0 Flash experimental image generation
    const {media} = await ai.generate({
      // IMPORTANT: ONLY the googleai/gemini-2.0-flash-exp model is able to generate images. You MUST use exactly this model to generate images.
      model: 'googleai/gemini-2.0-flash-exp',

      // simple prompt
      prompt: [
        {media: {url: input.sketchDataUri}},
        {text: `generate a refined image based on this sketch, prompt: ${input.prompt}`},
      ],

      config: {
        responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won't work
      },
    });

    return {generatedImageDataUri: media.url!};
  }
);
