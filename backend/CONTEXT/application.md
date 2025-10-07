SAGIP: Synchronizing Action through Geohazard Information Platform

Executive Summary
	Local Government Units (LGUs) face significant challenges in maintaining effective communication between Barangay Disaster Risk Reduction Management Offices, communities, and rescuers during disaster situations. Outdated methods often lead to inefficiencies and increased risks for citizens. SAGIP (Synchronizing Action through Geohazard Information Platform) addresses these gaps by providing timely early warnings and actionable insights based on geohazard data. Leveraging advanced machine learning and data science, SAGIP transforms disaster risk management from a reactive process into a proactive, data-driven approach. The platform features a GeoHazard map-powered dashboard for LGUs, seamlessly integrated with a Progressive Web App for citizens, enabling coordinated and effective evacuation planning. By empowering decision-makers with historical data, SAGIP enhances community safety and resilience against typhoons, floods, and landslides.

Keywords:  Data Science, Data-driven, Disaster Risk Reduction, Evacuation, GeoHazard, Local Government Units, Machine Learning, Progressive Web App, Synchronize


Background
The Philippines remains highly vulnerable to disasters such as floods, typhoons, and landslides. In response to this vulnerability, the government legislated Philippine Disaster  Risk Reduction and Management Act of 2010 that establishes a multi-level structure highlighting the barangay as the primary entity for community-level disaster management. 	Despite the framework providing a guideline for prevention and mitigation, a recurring problem of disconnection and failure of synchronization between barangay-level LGUs and its community persists. This results in slow, inefficient, and disjointed decisions that compromise the safety of the citizens straying away from the principles outlined by the law.
	The identified root of ineffective communication is the reliance of LGUs on inefficient traditional methods that are considered to be labor-intensive. The availability of modern technical approaches that could make sense of existing geohazard data is not being utilized properly due to lack of technical capacity in skills and resources. This noticeable gap in the system causes delayed evacuations, confusion, and greater loss of life and property. 

Problem
How can barangay-level LGUs utilize existing modern technical data-driven approaches to address gaps in outdated disaster response for better communication with the community to strengthen coordination, counter misinformation, and harness data-driven strategies that can save lives and build more resilient communities?

Objectives 

To introduce SAGIP, a modern disaster synchronization platform, to barangay-level LGUs for better communication with the community and data-driven decision making for proactive disaster risk reduction. 

SAGIP aims to:
Synchronize evacuees and rescuers
Provide optimal evacuation priority
Identify unreachable inhabited areas 
Equip LGUs with geohazard maps for data-driven decisions	

Scope & Limitations
	The solution will be focused on web-based implementation employing a client for both desktop and mobile using a Progressive Web App (PWA).  The system is designed for two key user groups: barangay officials, who will utilize the dashboard for early warnings and evacuation, and local residents who will use the PWA to receive the warnings and safety instructions. The scope of the data and features is limited to the target barangay and will exclusively use dataset provided in the PJDSC 2025 Catalog. The proposed solution will also be limited with the historical data to make it functional offline but will fetch updated data when online.


📝Methodology [Emman] [Vince]
This methodology lays out a project-based plan for building the SAGIP platform, directly tied to its four objectives. The system replaces outdated manual communication with a Progressive Web App (PWA) that works both online and offline, giving barangays the ability to coordinate evacuees, rescuers, and citizens through pre-cached hazard data and real-time updates.
Implementation and Core Features
Synchronize Evacuees & Rescuers: A registration and location-tracking feature will guide evacuees and rescuers to the same shelters, reducing delays and confusion. Cached maps and real-time updates will keep both groups aligned. Powered by Next.js + next-pwa for offline support.


SAGIP is equipped with a registration and location-tracking feature that synchronizes evacuees and rescuers through cached maps and real-time updates powered by Next.js + next-pwa for offline support.
Optimal Routes & Meeting Points: Using hazard datasets like LIPAD Flood Maps and PAGASA cyclone tracks, the system will pre-compute safe evacuation routes and store them in the PWA. LGUs can push updated routes when online. Data stored with Prisma + PostgreSQL for barangay-level reliability.
Hazard datasets will be utilized to pre-compute optimal routes and meeting points, stored in the PWA with Prisma + PostgreSQL for barangay-level reliability, updated by LGUs when online.


Identify Possible Casualties: Demographic data from Project CCHAIN will be used to highlight vulnerable groups (elderly, children, PWDs) in the LGU dashboard, ensuring rescuers know where to focus first. Reports and alerts delivered using Web Push or FCM for timely communication.


Geohazard Map for LGUs: UP NOAH and Open Hazards PH datasets will be layered on an interactive dashboard to show risks like floods, landslides, and storm surges. This supports faster and clearer decision-making for barangay officials. Citizen inputs stored in IndexedDB with Service Worker for offline reporting and sync.

	The app will be deployed on Vercel or Supabase for quick rollout and minimal overhead, while still being scalable for critical events. Together, this stack ensures SAGIP is lightweight, accessible, and dependable—even at the barangay level with weak or no connectivity.




https://rxdb.info/articles/progressive-web-app-database.html
https://angular.dev/ecosystem/service-workers
https://web.dev/learn/pwa/service-workers
https://alexop.dev/posts/what-is-local-first-web-development


References

Analytics Dashboards: Critical Tools for Data-Driven Decision making. (n.d.). https://www.getmonetizely.com/articles/analytics-dashboards-critical-tools-for-data-driven-decision-making
Catarata, A. T., & Villa, E. B. (2024). The extent of implementation of disaster risk reduction and management in the third district of Negros Oriental. International Journal of Multidisciplinary Applied Business and Education Research, 5(7), 2919–2949. https://doi.org/10.11594/ijmaber.05.07.38
Jibiki, Y., Kure, S., Kuri, M., & Ono, Y. (2015b). Analysis of early warning systems: The case of super-typhoon Haiyan. International Journal of Disaster Risk Reduction, 15, 24–28. https://doi.org/10.1016/j.ijdrr.2015.12.002
Jovita, H. D., Nurmandi, A., Mutiarin, D., & Purnomo, E. P. (2018). Why does network governance fail in managing post-disaster conditions in the Philippines? Jàmbá Journal of Disaster Risk Studies, 10(1). https://doi.org/10.4102/jamba.v10i1.585
Nielo, L. C. G. (2024). A disaster communication plan for Higher Education Institutions in the Island Province of Occidental Mindoro, Philippines. Frontiers in Communication, 9. https://doi.org/10.3389/fcomm.2024.1368221
Omnilert. (2025, September 3). Best Practices for testing Emergency Notification Systems | Omnilert. Omnilert. https://www.omnilert.com/blog/best-practices-for-testing-your-emergency-notification-system
Peregrino, P., & Espina, P. (2023, May 23). Calabarzon LGUs trained on social media for disaster communication. RAPPLER. https://www.rappler.com/environment/disasters/137824-calabarzon-lgus-trained-disaster-communication/
Ranada, P. (2023, November 9). Climate-vulnerable PH fails to fully spend disaster preparedness funds – study. RAPPLER. https://www.rappler.com/philippines/failure-fully-spend-disaster-preparedness-funds-oxfam-study/
Reynolds, B., & Seeger, M. W. (2005). Crisis and emergency risk communication as an integrative model. Journal of Health Communication, 10(1), 43–55. https://doi.org/10.1080/10810730590904571
Siar, S., & Lorenzo, P. J. (2022). Implementing Crisis and Risk Communication in a Pandemic: Insights from LGUs’ COVID-19 Experience. https://doi.org/10.62986/dp2022.32
The Benefits of SMS for Emergency Alerts | Mailchimp. (n.d.). Mailchimp. https://mailchimp.com/resources/emergency-sms-alert-system
Toyado, D. M. (2020a, July 28). Disaster preparedness of local government units communication systems in Catanduanes, Philippines. https://matjournals.co.in/index.php/JOCEI/article/view/3403?
